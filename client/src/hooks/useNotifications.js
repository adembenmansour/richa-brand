import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

// Hook personnalisé pour s'abonner aux notifications en temps réel via Server-Sent Events (SSE)
export default function useNotifications() {
  const { token } = useAuth();
  
  // États locaux
  const [notifications, setNotifications] = useState([]);
  const [nonLues, setNonLues] = useState(0);
  const [connecte, setConnecte] = useState(false);
  
  const eventSourceRef = useRef(null);

  // Fonction de connexion SSE
  const connecterSSE = useCallback(() => {
    if (!token) return;
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Le protocole EventSource ne supportant pas de headers HTTP personnalisés, 
    // nous passons le jeton d'authentification directement dans l'URL de connexion.
    const url = `/api/orders/stream?token=${token}`;
    const es = new EventSource(url);

    // Événement d'ouverture de la connexion SSE
    es.onopen = () => {
      setConnecte(true);
      console.log("✓ Connexion SSE établie avec succès.");
    };

    // Réception d'un message du serveur SSE
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Ignorer le message de ping/connexion initial
        if (data.type === "connected") return;

        if (data.type === "nouvelle_commande") {
          // Création de l'objet notification local
          const nouvelleNotif = {
            id: Date.now() + Math.random(),
            ...data,
            lue: false,
            timestamp: new Date(data.timestamp)
          };

          // Ajouter en début de tableau et limiter à 50 notifications
          setNotifications(prev => [nouvelleNotif, ...prev].slice(0, 50));
          setNonLues(prev => prev + 1);

          // Émettre un bip audio discret (API Web Audio)
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.frequency.value = 880; // Fréquence en Hz (La)
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.3);
          } catch (audioErr) {
            console.warn("Échec du bip sonore de notification:", audioErr);
          }

          // Déclencher une notification système native si permise
          if (Notification.permission === "granted") {
            try {
              new Notification("🛒 NOUVELLE COMMANDE — RICHA", {
                body: `${data.client} · ${data.total} DT · ${data.gouvernorat}`,
                icon: "/favicon.ico"
              });
            } catch (notifErr) {
              console.warn("Échec de l'affichage de la notification système:", notifErr);
            }
          }
        }
      } catch (parseErr) {
        console.error("Erreur de parsing du message SSE reçu:", parseErr);
      }
    };

    // En cas d'erreur de connexion, fermeture et planification de la reconnexion sous 5 secondes
    es.onerror = () => {
      setConnecte(false);
      es.close();
      console.log("✗ Déconnexion SSE. Tentative de reconnexion dans 5 secondes...");
      setTimeout(connecterSSE, 5000);
    };

    eventSourceRef.current = es;
  }, [token]);

  useEffect(() => {
    connecterSSE();

    // Demander la permission pour les notifications de bureau au chargement
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    // Nettoyer la connexion EventSource lors du démontage du hook
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connecterSSE]);

  // Actions de marquage des états
  const marquerToutesLues = () => {
    setNotifications(prev => prev.map(n => ({ ...n, lue: true })));
    setNonLues(0);
  };

  const marquerLue = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, lue: true } : n)
    );
    setNonLues(prev => Math.max(0, prev - 1));
  };

  const supprimerNotif = (id) => {
    setNotifications(prev => {
      const target = prev.find(n => n.id === id);
      if (target && !target.lue) {
        setNonLues(unread => Math.max(0, unread - 1));
      }
      return prev.filter(n => n.id !== id);
    });
  };

  return {
    notifications,
    nonLues,
    connecte,
    marquerToutesLues,
    marquerLue,
    supprimerNotif
  };
}

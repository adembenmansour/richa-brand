import React from "react";

export default function DeliveryTimeline() {
  const steps = [
    {
      id: 1,
      status: "completed", // fond noir, check blanc
      title: "COMMANDE REÇUE",
      subtitle: "AUJOURD'HUI - CONFIRMÉE",
      icon: "✓"
    },
    {
      id: 2,
      status: "active", // cercle vide avec rond intérieur actif
      title: "PRÉPARATION DU COLIS",
      subtitle: "DANS LES 24H - EN COURS",
      icon: ""
    },
    {
      id: 3,
      status: "pending", // cercle vide standard
      title: "EXPÉDITION",
      subtitle: "J+1 À J+2 - À VENIR",
      icon: ""
    },
    {
      id: 4,
      status: "pending",
      title: "LIVRAISON À DOMICILE",
      subtitle: "J+2 À J+4 - PAIEMENT À LA LIVRAISON",
      icon: ""
    }
  ];

  return (
    <div className="timeline-container">
      <div className="timeline-line"></div>
      
      {steps.map((step, idx) => {
        let dotClass = "timeline-dot";
        if (step.status === "completed") dotClass += " completed";
        if (step.status === "active") dotClass += " active";

        return (
          <div
            className="timeline-item"
            key={step.id}
            style={{
              animationDelay: `${idx * 150}ms`,
              animationPlayState: "running"
            }}
          >
            <div className={dotClass}>
              {step.icon}
            </div>
            
            <div className="timeline-content">
              <h4 className="timeline-title">{step.title}</h4>
              <p className="timeline-subtitle">{step.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

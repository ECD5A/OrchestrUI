globalThis.ORCHESTRUI_FIXTURES = Object.freeze([
  {
    "id": "daisy-admin",
    "label": "daisyUI admin",
    "run_id": "DAISY-ADMIN",
    "input_mode": "structured-profiles",
    "summary": "Preserve the existing host system without adding an OrchestrUI ecosystem.",
    "host": {
      "framework": "React",
      "base": "daisyUI",
      "tokens": "daisyUI themes",
      "gap": "product-polish, forms-controls"
    },
    "selected": [
      {
        "id": "daisyui",
        "role": "base-system",
        "capability": "forms-controls"
      }
    ],
    "rejected": [
      {
        "id": "kokonut-ui",
        "rule_id": "base-system-conflict"
      },
      {
        "id": "react-bits",
        "rule_id": "minimum-set"
      },
      {
        "id": "bklit-ui",
        "rule_id": "minimum-set"
      },
      {
        "id": "animejs",
        "rule_id": "minimum-set"
      },
      {
        "id": "rive",
        "rule_id": "minimum-set"
      },
      {
        "id": "magic-ui",
        "rule_id": "minimum-set"
      }
    ],
    "owners": [
      {
        "role": "base-system",
        "owner": "daisyui",
        "source": "host-profile",
        "evidence": "HostProfile.design_system declares daisyUI."
      }
    ],
    "decisions": [
      {
        "outcome": "preserved",
        "subject": "daisyui",
        "rule_id": "existing-stack-first",
        "evidence": [
          "base-system is already owned by daisyUI."
        ]
      },
      {
        "outcome": "preserved",
        "subject": "daisyui",
        "rule_id": "existing-stack-first",
        "evidence": [
          "TaskProfile.required_capabilities includes forms-controls.",
          "HostProfile.design_system declares daisyUI."
        ]
      },
      {
        "outcome": "rejected",
        "subject": "kokonut-ui",
        "rule_id": "base-system-conflict",
        "evidence": [
          "Kokonut is a shadcn-compatible layer and is not added on top of a daisyUI base without an isolation plan."
        ]
      }
    ],
    "audit": {
      "verified_score": 10,
      "verified_maximum": 10,
      "maximum_score": 18,
      "pending_checks": [
        "visual coherence",
        "accessibility",
        "responsiveness",
        "engineering checks/dependencies/secrets"
      ],
      "blockers": []
    }
  },
  {
    "id": "marketing-landing",
    "label": "Marketing landing",
    "run_id": "MARKETING-LANDING",
    "input_mode": "structured-profiles",
    "summary": "Add 2 ecosystems; preserve every compatible host owner.",
    "host": {
      "framework": "Next.js 15",
      "base": "shadcn/ui",
      "tokens": "CSS variables, brand motion durations",
      "gap": "signature-creative-effect, marketing-motion"
    },
    "selected": [
      {
        "id": "magic-ui",
        "role": "marketing-enhancement",
        "capability": "marketing-motion"
      },
      {
        "id": "react-bits",
        "role": "signature-effect",
        "capability": "signature-creative-effect"
      }
    ],
    "rejected": [
      {
        "id": "kokonut-ui",
        "rule_id": "minimum-set"
      },
      {
        "id": "daisyui",
        "rule_id": "minimum-set"
      },
      {
        "id": "bklit-ui",
        "rule_id": "minimum-set"
      },
      {
        "id": "animejs",
        "rule_id": "minimum-set"
      },
      {
        "id": "rive",
        "rule_id": "minimum-set"
      }
    ],
    "owners": [
      {
        "role": "base-system",
        "owner": "host:shadcn-ui",
        "source": "host-profile",
        "evidence": "HostProfile.design_system declares shadcn/ui."
      },
      {
        "role": "marketing-enhancement",
        "owner": "magic-ui",
        "source": "selected-library",
        "evidence": "magic-ui selected for marketing-motion."
      },
      {
        "role": "signature-effect",
        "owner": "react-bits",
        "source": "selected-library",
        "evidence": "react-bits selected for signature-creative-effect."
      }
    ],
    "decisions": [
      {
        "outcome": "preserved",
        "subject": "host:shadcn-ui",
        "rule_id": "existing-stack-first",
        "evidence": [
          "base-system is already owned by shadcn/ui."
        ]
      },
      {
        "outcome": "selected",
        "subject": "magic-ui",
        "rule_id": "role-ownership",
        "evidence": [
          "TaskProfile.required_capabilities includes marketing-motion.",
          "Policy route marketing-motion -> marketing-enhancement -> magic-ui."
        ]
      },
      {
        "outcome": "selected",
        "subject": "react-bits",
        "rule_id": "role-ownership",
        "evidence": [
          "TaskProfile.required_capabilities includes signature-creative-effect.",
          "Policy route signature-creative-effect -> signature-effect -> react-bits."
        ]
      }
    ],
    "audit": {
      "verified_score": 8,
      "verified_maximum": 8,
      "maximum_score": 18,
      "pending_checks": [
        "visual coherence",
        "accessibility",
        "responsiveness",
        "motion/reduced-motion",
        "engineering checks/dependencies/secrets"
      ],
      "blockers": []
    }
  },
  {
    "id": "next-shadcn-dashboard",
    "label": "Next.js dashboard",
    "run_id": "NEXT-SHADCN-DASHBOARD",
    "input_mode": "structured-profiles",
    "summary": "Add 1 ecosystem; preserve every compatible host owner.",
    "host": {
      "framework": "Next.js 15",
      "base": "shadcn/ui",
      "tokens": "CSS variables, shadcn semantic colors",
      "gap": "data-visualization"
    },
    "selected": [
      {
        "id": "bklit-ui",
        "role": "data-visualization",
        "capability": "data-visualization"
      }
    ],
    "rejected": [
      {
        "id": "kokonut-ui",
        "rule_id": "minimum-set"
      },
      {
        "id": "react-bits",
        "rule_id": "minimum-set"
      },
      {
        "id": "daisyui",
        "rule_id": "minimum-set"
      },
      {
        "id": "animejs",
        "rule_id": "minimum-set"
      },
      {
        "id": "rive",
        "rule_id": "minimum-set"
      },
      {
        "id": "magic-ui",
        "rule_id": "minimum-set"
      }
    ],
    "owners": [
      {
        "role": "base-system",
        "owner": "host:shadcn-ui",
        "source": "host-profile",
        "evidence": "HostProfile.design_system declares shadcn/ui."
      },
      {
        "role": "data-visualization",
        "owner": "bklit-ui",
        "source": "selected-library",
        "evidence": "bklit-ui selected for data-visualization."
      }
    ],
    "decisions": [
      {
        "outcome": "preserved",
        "subject": "host:shadcn-ui",
        "rule_id": "existing-stack-first",
        "evidence": [
          "base-system is already owned by shadcn/ui."
        ]
      },
      {
        "outcome": "selected",
        "subject": "bklit-ui",
        "rule_id": "role-ownership",
        "evidence": [
          "TaskProfile.required_capabilities includes data-visualization.",
          "Policy route data-visualization -> data-visualization -> bklit-ui."
        ]
      }
    ],
    "audit": {
      "verified_score": 8,
      "verified_maximum": 8,
      "maximum_score": 18,
      "pending_checks": [
        "visual coherence",
        "accessibility",
        "responsiveness",
        "data-viz readability",
        "engineering checks/dependencies/secrets"
      ],
      "blockers": []
    }
  }
]);

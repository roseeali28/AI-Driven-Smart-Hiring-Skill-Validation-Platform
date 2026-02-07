"""
Model Loader — Load and manage ML models for scoring
MVP: Rule-based weights; Scalable: Load persisted scikit-learn/LightGBM models
"""

import os
from typing import Dict, Optional

# Default rule-based weights (explainable, no black box)
DEFAULT_WEIGHTS = {
    "assessment": 0.35,
    "coding": 0.25,
    "certificate": 0.20,
    "learning": 0.10,
    "skill_relevance": 0.10,
}

MODEL_PATH = os.environ.get("MODEL_PATH", "./models")


def load_weights() -> Dict[str, float]:
    """
    Load scoring weights. MVP uses fixed rule-based weights.
    Future: Load from JSON/config or trained model.
    """
    weights_file = os.path.join(MODEL_PATH, "weights.json")
    if os.path.exists(weights_file):
        try:
            import json
            with open(weights_file, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return DEFAULT_WEIGHTS.copy()


def load_model():
    """
    Load ML model for adaptive scoring. MVP returns None (rule-based only).
    Future: Load pickle/joblib model for learned weights.
    """
    model_file = os.path.join(MODEL_PATH, "credibility_model.pkl")
    if os.path.exists(model_file):
        try:
            import joblib
            return joblib.load(model_file)
        except Exception:
            pass
    return None


def get_scoring_config() -> Dict:
    """
    Get scoring configuration (weights, model presence).
    """
    weights = load_weights()
    model = load_model()
    return {
        "weights": weights,
        "model_loaded": model is not None,
        "mode": "rule_based" if model is None else "ml_enhanced",
    }

import React, { useState } from 'react';
import { Sparkles, Compass, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';

export default function ScentQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      title: "When does your presence speak with greatest potency?",
      options: [
        { label: "Twilight Nocturne", desc: "As dusk descends and shadows cast golden silhouettes", code: "twilight" },
        { label: "Midnight Velvet", desc: "Behind closed doors beneath crystal chandeliers and muted murmurs", code: "midnight" },
        { label: "Radiant Solstice", desc: "High daylight, effortless poise and commanding clarity", code: "solstice" }
      ]
    },
    {
      title: "What visceral impression do you wish to leave in your wake?",
      options: [
        { label: "Intimate Enigma", desc: "A scent that draws people in close, begging to be deciphered", code: "enigma" },
        { label: "Sovereign Warmth", desc: "A regal aura of molten amber, aged oud, and liquid gold", code: "sovereign" },
        { label: "Poetic Sophistication", desc: "Delicate damask petals cloaked in smoky balsamic incense", code: "poetic" }
      ]
    }
  ];

  const handleSelect = (code) => {
    const nextAnswers = { ...answers, [step]: code };
    setAnswers(nextAnswers);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setStep(questions.length); // Result state
    }
  };

  const resetQuiz = () => {
    setStep(0);
    setAnswers({});
  };

  return (
    <section className="quiz-section">
      <div className="quiz-card luxury-glass">
        <div className="quiz-top-badge">
          <Sparkles size={14} className="gold-icon" />
          <span className="font-royal">Bespoke Olfactory Diagnostic</span>
        </div>

        <h3 className="quiz-main-title font-royal">
          Find Your <span className="gold-gradient-text">Signature Profile</span>
        </h3>
        <p className="quiz-subtitle font-poetic">
          Every human skin chemistry calls for a distinct harmonic signature.
        </p>

        {step < questions.length ? (
          <div className="quiz-step-content">
            <div className="quiz-progress-bar">
              <div 
                className="quiz-progress-fill" 
                style={{ width: `${((step + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
            
            <p className="quiz-question-number font-royal">
              Phase 0{step + 1} of 0{questions.length}
            </p>
            <h4 className="quiz-question-title">{questions[step].title}</h4>

            <div className="quiz-options-list">
              {questions[step].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(opt.code)}
                  className="quiz-option-btn"
                >
                  <div className="option-info">
                    <span className="option-title font-royal">{opt.label}</span>
                    <span className="option-desc">{opt.desc}</span>
                  </div>
                  <ArrowRight size={16} className="option-arrow gold-icon" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Result state */
          <div className="quiz-result-box">
            <div className="result-badge">
              <CheckCircle2 size={18} className="gold-icon" />
              <span className="font-royal">Your Prescribed Signature</span>
            </div>

            <h4 className="result-title font-royal gold-shimmer-text">
              MOHERA • NOIR & OR — EXTRAIT DE PARFUM
            </h4>

            <p className="result-profile-desc font-poetic">
              “Your profile is defined by regal magnetism and smoky amber depth. The combination of rare aged agarwood, 
              Grasse black rose, and warm bourbon vanilla will evolve into an undeniable second skin.”
            </p>

            <div className="result-meta-grid">
              <div className="result-meta-item">
                <span className="meta-lbl">Aura Radius</span>
                <span className="meta-val font-royal">High Sillage (2-3 Meters)</span>
              </div>
              <div className="result-meta-item">
                <span className="meta-lbl">Skin Longevity</span>
                <span className="meta-val font-royal">24+ Hours Persistent</span>
              </div>
              <div className="result-meta-item">
                <span className="meta-lbl">Best Suited For</span>
                <span className="meta-val font-royal">Evening Grandeur & Signature Presence</span>
              </div>
            </div>

            <div className="result-actions">
              <button onClick={() => {
                const el = document.getElementById('waitlist-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }} className="btn-gold">
                <span>Reserve Batch 01 Allocation</span>
              </button>

              <button onClick={resetQuiz} className="btn-outline-gold">
                <RotateCcw size={14} />
                <span>Recalibrate</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

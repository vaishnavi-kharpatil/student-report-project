const API_URL = 'http://localhost:3000/api/student';

function classify(score) {
  if (score >= 8) return { label: 'Excellent', cls: 'success' };
  if (score >= 6) return { label: 'Good', cls: 'warn' };
  return { label: 'Needs improvement', cls: 'danger' };
}

function skillFeedback(skill, score) {
  const s = Number(score) || 0;
  switch (skill) {
    case 'pronunciation':
      if (s >= 8) return 'Your pronunciation is clear and accurate, with excellent control of stress and intonation. Listeners can easily understand you, and your accent rarely interferes with communication. This shows strong mastery of spoken sounds and rhythm.';
      if (s >= 6) return 'Your pronunciation is generally understandable, though occasional mispronunciations or stress errors occur. Most of the time your speech is clear, but certain sounds or words may need refinement. With practice, you can achieve more consistent clarity.';
      return 'Your pronunciation often makes speech difficult to follow, with frequent errors in sounds or stress. Intonation patterns may be inconsistent, reducing intelligibility. Focused practice on sound accuracy and rhythm will help improve clarity.';
    case 'fluency':
      if (s >= 8) return 'You speak smoothly with natural pacing and rhythm, rarely hesitating or pausing unnecessarily. Ideas flow logically and coherently, making your speech easy to follow. This demonstrates strong confidence and control in spoken delivery.';
      if (s >= 6) return 'You are mostly fluent, though minor pauses or self-corrections occur. Your speech maintains coherence and rhythm, but occasional hesitation may affect flow. Continued practice will help reduce interruptions and improve pacing.';
      return 'Frequent pauses and hesitations interrupt your speech, making it harder to maintain coherence. You may struggle to connect ideas smoothly, which affects listener understanding. Working on pacing and connected speech will strengthen fluency.';
    case 'vocabulary':
      if (s >= 8) return 'You use a wide range of vocabulary with precise word choice and occasional idiomatic expressions. Your ability to paraphrase and vary language makes your speech engaging and flexible. This shows strong lexical control across topics.';
      if (s >= 6) return 'Your vocabulary is adequate for common topics, though you sometimes repeat words or choose less precise terms. You can usually express ideas clearly, but expanding your word range will improve accuracy and variety. Practice with synonyms and topic-specific words will help.';
      return 'Your vocabulary is limited, which restricts your ability to express ideas clearly. You may rely on basic words and struggle with precision or variety. Building a stronger word bank will allow you to communicate more effectively.';
    case 'grammar':
      if (s >= 8) return 'You use both simple and complex grammatical structures accurately, with only rare errors. Your sentences are varied and flexible, showing strong control of grammar. This enhances clarity and sophistication in your speech.';
      if (s >= 6) return 'You generally use grammar correctly, though errors appear in complex structures. Simple sentences are clear, but flexibility is somewhat limited. With more practice, you can reduce mistakes and expand your range of structures.';
      return 'Frequent grammatical errors reduce clarity and limit your ability to express complex ideas. You may rely heavily on simple patterns, with mistakes affecting listener understanding. Strengthening basic grammar and gradually adding complexity will improve accuracy.';
    default:
      return '';
  }
}

function overallFeedback(overall, scores) {
  const o = Number(overall) || 0;
  const arr = Object.values(scores).map(Number);
  const min = Math.min(...arr);
  const max = Math.max(...arr);

  let base;
  if (o >= 8) base = 'Excellent overall control with confident delivery. Your speech is clear, fluent, and well-structured, showing strong command of language.';
  else if (o >= 6) base = 'Good overall performance with minor inaccuracies. You communicate effectively, though occasional errors or hesitations appear.';
  else base = 'Performance needs improvement across core areas. Frequent issues reduce clarity and coherence, making communication less effective.';

  const spreadNote = max - min >= 3
    ? ' There is notable variation across skills; focus on balancing weaker areas to achieve consistency.'
    : ' Your skills are relatively balanced, which supports steady progress across all areas.';

  return base + spreadNote;
}

function setPill(el, cls, label) {
  el.textContent = label;
  el.classList.remove('success', 'warn', 'danger');
  el.classList.add(cls);
}

function setBar(el, score) {
  const pct = Math.max(0, Math.min(100, (Number(score) / 9) * 100));
  el.style.width = pct + '%';
  el.textContent = Number(score).toFixed(0);
  el.style.background =
    score >= 8 ? 'linear-gradient(90deg,#16a34a,#22c55e)' :
    score >= 6 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' :
                 'linear-gradient(90deg,#dc2626,#ef4444)';
}

async function init() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    document.getElementById('student-name').textContent = `Student: ${data.name || '—'}`;
    document.getElementById('overall-score').textContent = data.overall ?? '—';

    const overallClass = classify(data.overall);
    setPill(document.getElementById('overall-pill'), overallClass.cls, overallClass.label);
    document.getElementById('overall-feedback').textContent = overallFeedback(data.overall, data.scores || {});

    const map = [
      { key: 'pronunciation', bar: 'bar-pronunciation', chip: 'score-pronunciation', pill: 'pill-pronunciation', fb: 'feedback-pronunciation' },
      { key: 'fluency', bar: 'bar-fluency', chip: 'score-fluency', pill: 'pill-fluency', fb: 'feedback-fluency' },
      { key: 'vocabulary', bar: 'bar-vocabulary', chip: 'score-vocabulary', pill: 'pill-vocabulary', fb: 'feedback-vocabulary' },
      { key: 'grammar', bar: 'bar-grammar', chip: 'score-grammar', pill: 'pill-grammar', fb: 'feedback-grammar' }
    ];

    map.forEach(({ key, bar, chip, pill, fb }) => {
      const score = data.scores?.[key];
      document.getElementById(chip).textContent = typeof score === 'number' ? `${score} / 9` : '—';
      if (typeof score === 'number') {
        setBar(document.getElementById(bar), score);
        const cls = classify(score);
        setPill(document.getElementById(pill), cls.cls, cls.label);
        document.getElementById(fb).textContent = skillFeedback(key, score);
      } else {
        document.getElementById(fb).textContent = '—';
      }
    });
  } catch (e) {
    console.error('Failed to load student data:', e);
    document.getElementById('overall-feedback').textContent =
      'Unable to load data. Please ensure the backend is running on localhost:3000.';
  }
}

init();
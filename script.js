(() => {
  'use strict';

  const MPH_TO_MS = 0.44704;
  const defaults = { massA: 450, speedA: 23.7, massB: 450, speedB: 23.7, restitution: 0.2, duration: 0.15, deformation: 0.4 };
  const ids = { massA: 'mass-a', speedA: 'speed-a', massB: 'mass-b', speedB: 'speed-b', restitution: 'restitution', duration: 'duration', deformation: 'deformation' };
  const fields = Object.fromEntries(Object.entries(ids).map(([key, id]) => [key, document.getElementById(id)]));
  const outputs = Object.fromEntries(['force-duration', 'closing-speed', 'force-distance', 'final-a', 'final-b', 'impulse', 'initial-energy', 'final-energy', 'energy-lost'].map(id => [id, document.getElementById(id)]));
  const error = document.getElementById('form-error');
  const copyStatus = document.getElementById('copy-status');
  let current = null;

  function format(value, maximumFractionDigits = 1) {
    if (!Number.isFinite(value)) return '—';
    if (Math.abs(value) >= 1e9) return value.toExponential(2);
    return new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(value);
  }

  function validate(values) {
    const rules = [
      ['massA', 'Camel A mass must be greater than zero.'], ['massB', 'Camel B mass must be greater than zero.'],
      ['speedA', 'Camel A speed cannot be negative.'], ['speedB', 'Camel B speed cannot be negative.'],
      ['restitution', 'Restitution must be between 0 and 1.'],
      ['duration', 'Impact duration must be greater than zero.'], ['deformation', 'Total compression must be greater than zero.']
    ];
    for (const [key, message] of rules) {
      const value = values[key];
      const input = fields[key];
      if (!Number.isFinite(value) || input.value.trim() === '' || !input.checkValidity() ||
          ((key === 'massA' || key === 'massB' || key === 'duration' || key === 'deformation') && value <= 0) ||
          ((key === 'speedA' || key === 'speedB') && value < 0) ||
          (key === 'restitution' && (value < 0 || value > 1))) return { key, message };
    }
    return null;
  }

  function calculate(v) {
    const uA = v.speedA * MPH_TO_MS;
    const uB = -v.speedB * MPH_TO_MS;
    const closing = uA - uB;
    const totalMass = v.massA + v.massB;
    const reducedMass = v.massA * v.massB / totalMass;
    const impulse = reducedMass * (1 + v.restitution) * closing;
    const finalA = uA - impulse / v.massA;
    const finalB = uB + impulse / v.massB;
    const initialEnergy = 0.5 * v.massA * uA ** 2 + 0.5 * v.massB * uB ** 2;
    const finalEnergy = 0.5 * v.massA * finalA ** 2 + 0.5 * v.massB * finalB ** 2;
    const relativeEnergy = 0.5 * reducedMass * closing ** 2;
    return {
      closingMph: v.speedA + v.speedB, finalAMph: finalA / MPH_TO_MS, finalBMph: finalB / MPH_TO_MS,
      impulse, initialEnergy, finalEnergy, energyLost: Math.max(0, initialEnergy - finalEnergy),
      forceDuration: impulse / v.duration, forceDistance: relativeEnergy / v.deformation
    };
  }

  function direction(value) {
    if (Math.abs(value) < 0.005) return 'Approximately stationary after impact';
    return value > 0 ? 'Moving right after impact' : 'Moving left after impact';
  }

  function render() {
    const values = Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, Number(input.value)]));
    const problem = validate(values);
    for (const [key, input] of Object.entries(fields)) input.setAttribute('aria-invalid', String(problem?.key === key));
    error.hidden = !problem;
    error.textContent = problem?.message || '';
    if (problem) {
      current = null;
      for (const output of Object.values(outputs)) output.textContent = '—';
      copyStatus.textContent = '';
      return;
    }
    const result = calculate(values);
    current = { values, result };
    outputs['force-duration'].textContent = format(result.forceDuration, 0);
    outputs['closing-speed'].textContent = format(result.closingMph);
    outputs['force-distance'].textContent = format(result.forceDistance, 0);
    outputs['final-a'].textContent = format(result.finalAMph, 2);
    outputs['final-b'].textContent = format(result.finalBMph, 2);
    outputs.impulse.textContent = format(result.impulse, 0);
    outputs['initial-energy'].textContent = format(result.initialEnergy, 0);
    outputs['final-energy'].textContent = format(result.finalEnergy, 0);
    outputs['energy-lost'].textContent = format(result.energyLost, 0);
    document.getElementById('final-a-direction').textContent = direction(result.finalAMph);
    document.getElementById('final-b-direction').textContent = direction(result.finalBMph);
    document.getElementById('visual-a').textContent = `${format(values.speedA)} mph →`;
    document.getElementById('visual-b').textContent = `← ${format(values.speedB)} mph`;
    copyStatus.textContent = '';
  }

  function summary() {
    const { values: v, result: r } = current;
    const lines = [
      "Pat's Impact Lab — head-on collision estimate",
      `Camel A: ${format(v.massA)} kg at ${format(v.speedA)} mph toward impact; Camel B: ${format(v.massB)} kg at ${format(v.speedB)} mph toward impact.`,
      `Restitution: ${v.restitution}; contact time: ${v.duration} s; combined compression: ${v.deformation} m.`,
      `Closing speed: ${format(r.closingMph)} mph. Final velocities: A ${format(r.finalAMph, 2)} mph, B ${format(r.finalBMph, 2)} mph (positive is toward B).`,
      `Impulse on each: ${format(r.impulse, 0)} N·s. Initial kinetic energy: ${format(r.initialEnergy, 0)} J; final: ${format(r.finalEnergy, 0)} J; dissipated: ${format(r.energyLost, 0)} J.`,
      `Average contact force from time: ${format(r.forceDuration, 0)} N. Compression-phase force estimate from distance: ${format(r.forceDistance, 0)} N. Peak force is unknown.`,
      'Educational one-dimensional model only; not for injury, equipment, or safety decisions.'
    ];
    if (location.protocol === 'http:' || location.protocol === 'https:') {
      const link = new URL(location.href);
      link.hash = '';
      link.search = new URLSearchParams(Object.entries(v).map(([key, value]) => [key, String(value)])).toString();
      lines.push(`Explore these inputs: ${link.href}`);
    }
    return lines.join('\n');
  }

  async function copySummary() {
    if (!current) { copyStatus.textContent = 'Enter valid values first.'; return; }
    try {
      await navigator.clipboard.writeText(summary());
      copyStatus.textContent = 'Summary copied to clipboard.';
    } catch (_) {
      copyStatus.textContent = 'Clipboard unavailable. Select and copy the results on this page.';
    }
  }

  const params = new URLSearchParams(location.search);
  if (Object.keys(defaults).every(key => params.has(key))) {
    for (const key of Object.keys(defaults)) fields[key].value = params.get(key);
  }
  for (const input of Object.values(fields)) input.addEventListener('input', render);
  document.getElementById('reset-button').addEventListener('click', () => {
    for (const [key, value] of Object.entries(defaults)) fields[key].value = value;
    render();
  });
  document.getElementById('copy-summary').addEventListener('click', copySummary);
  render();

  if (document.modelContext?.registerTool) {
    try {
      Promise.resolve(document.modelContext.registerTool({
        name: 'configure_collision',
        title: 'Configure collision',
        description: 'Set the seven collision inputs and update the visible results.',
        inputSchema: {
          type: 'object',
          properties: Object.fromEntries(Object.keys(defaults).map(key => [key, { type: 'number' }])),
          required: Object.keys(defaults), additionalProperties: false
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input) {
          if (!input || typeof input !== 'object' || Object.keys(defaults).some(key => typeof input[key] !== 'number' || !Number.isFinite(input[key]))) throw new Error('All seven inputs must be finite numbers.');
          const previous = Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.value]));
          for (const key of Object.keys(defaults)) fields[key].value = input[key];
          const values = Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, Number(field.value)]));
          const problem = validate(values);
          if (problem) {
            for (const key of Object.keys(defaults)) fields[key].value = previous[key];
            throw new Error(problem.message);
          }
          render();
          return { closingSpeedMph: current.result.closingMph, averageContactForceN: current.result.forceDuration, compressionEstimateN: current.result.forceDistance };
        }
      })).catch(() => {});
    } catch (_) { /* The calculator still works in browsers without WebMCP. */ }
  }
})();

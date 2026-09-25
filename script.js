(() => {
  'use strict';

  const KMH_TO_MS = 1 / 3.6;
  const STANDARD_GRAVITY = 9.80665;
  const fields = Object.fromEntries([...document.querySelectorAll('input[name]')].map(input => [input.name, input]));
  // HTML's value attributes are the single source of truth for the starting scenario.
  const defaults = Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, Number(input.defaultValue)]));
  const validationMessages = {
    massA: 'Camel A mass must be greater than zero.', massB: 'Camel B mass must be greater than zero.',
    speedA: 'Camel A speed cannot be negative.', speedB: 'Camel B speed cannot be negative.',
    restitution: 'Restitution must be between 0 and 1.',
    duration: 'Impact duration must be greater than zero.', deformation: 'Total compression must be greater than zero.'
  };
  const outputs = Object.fromEntries(['force-duration', 'weight-equivalent', 'closing-speed', 'force-distance', 'net-velocity', 'impulse', 'initial-energy', 'final-energy', 'energy-lost'].map(id => [id, document.getElementById(id)]));
  const error = document.getElementById('form-error');
  const copyStatus = document.getElementById('copy-status');
  let current = null;

  function format(value, maximumFractionDigits = 1) {
    if (!Number.isFinite(value)) return '—';
    if (Math.abs(value) >= 1e9) return value.toExponential(2);
    return new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(value);
  }

  function formatSigned(value, digits = 3) {
    if (Math.abs(value) < 0.0005) return '0';
    return `${value > 0 ? '+' : ''}${format(value, digits)}`;
  }

  function validate(values) {
    for (const [key, input] of Object.entries(fields)) {
      // The input's required/min/max attributes hold the numeric limits.
      if (!input.value || !Number.isFinite(values[key]) || !input.checkValidity()) {
        return { key, message: validationMessages[key] };
      }
    }
    return null;
  }

  function readValues() {
    return Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, Number(input.value)]));
  }

  function calculate(v) {
    // Right is positive: A approaches from the left, B from the right.
    const uA = v.speedA * KMH_TO_MS;
    const uB = -v.speedB * KMH_TO_MS;
    const closing = uA - uB;
    // Momentum conservation and restitution give J = μ(1 + e)(uA - uB).
    const reducedMass = v.massA * v.massB / (v.massA + v.massB);
    const impulse = reducedMass * (1 + v.restitution) * closing;
    const finalA = uA - impulse / v.massA;
    const finalB = uB + impulse / v.massB;
    // The system's center-of-mass velocity is the one signed net velocity.
    const netFinalVelocity = (v.massA * finalA + v.massB * finalB) / (v.massA + v.massB);
    const initialEnergy = 0.5 * v.massA * uA ** 2 + 0.5 * v.massB * uB ** 2;
    const finalEnergy = 0.5 * v.massA * finalA ** 2 + 0.5 * v.massB * finalB ** 2;
    // Distance estimates average force during compression, before any rebound.
    const relativeEnergy = 0.5 * reducedMass * closing ** 2;
    return {
      closingKmh: v.speedA + v.speedB, netFinalKmh: netFinalVelocity / KMH_TO_MS,
      impulse, initialEnergy, finalEnergy, energyLost: Math.max(0, initialEnergy - finalEnergy),
      forceDuration: impulse / v.duration, forceDistance: relativeEnergy / v.deformation
    };
  }

  function netDirection(value) {
    if (Math.abs(value) < 0.0005) return 'Zero: no net motion from the impact point.';
    return value > 0 ? 'Positive: net motion toward Camel B.' : 'Negative: net motion toward Camel A.';
  }

  function render() {
    const values = readValues();
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
    outputs['weight-equivalent'].textContent = format(result.forceDuration / (1000 * STANDARD_GRAVITY), 2);
    outputs['closing-speed'].textContent = format(result.closingKmh);
    outputs['force-distance'].textContent = format(result.forceDistance, 0);
    outputs['net-velocity'].textContent = formatSigned(result.netFinalKmh);
    outputs.impulse.textContent = format(result.impulse, 0);
    outputs['initial-energy'].textContent = format(result.initialEnergy, 0);
    outputs['final-energy'].textContent = format(result.finalEnergy, 0);
    outputs['energy-lost'].textContent = format(result.energyLost, 0);
    document.getElementById('net-direction').textContent = netDirection(result.netFinalKmh);
    document.getElementById('visual-a').textContent = `${format(values.speedA)} km/h →`;
    document.getElementById('visual-b').textContent = `← ${format(values.speedB)} km/h`;
    copyStatus.textContent = '';
  }

  function summary() {
    const { values: v, result: r } = current;
    const lines = [
      "Pat's Impact Force Calculator — head-on collision estimate",
      `Camel A: ${format(v.massA)} kg at ${format(v.speedA)} km/h toward impact; Camel B: ${format(v.massB)} kg at ${format(v.speedB)} km/h toward impact.`,
      `Restitution: ${v.restitution}; contact time: ${v.duration} s; combined compression: ${v.deformation} m.`,
      `Closing speed: ${format(r.closingKmh)} km/h. Net final velocity of the center of mass: ${formatSigned(r.netFinalKmh)} km/h (negative toward A, positive toward B; zero at the impact point).`,
      `Impulse on each: ${format(r.impulse, 0)} N·s. Initial kinetic energy: ${format(r.initialEnergy, 0)} J; final: ${format(r.finalEnergy, 0)} J; dissipated: ${format(r.energyLost, 0)} J.`,
      `Average contact force from time: ${format(r.forceDuration, 0)} N. Compression-phase force estimate from distance: ${format(r.forceDistance, 0)} N. Peak force is unknown.`,
      `For scale, the average contact force matches the weight of about ${format(r.forceDuration / (1000 * STANDARD_GRAVITY), 2)} metric tonnes at standard Earth gravity; this is only a force-magnitude comparison.`,
      'Educational one-dimensional model only; not for injury, equipment, or safety decisions. Consult a professional engineer.'
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
          const problem = validate(readValues());
          if (problem) {
            for (const key of Object.keys(defaults)) fields[key].value = previous[key];
            throw new Error(problem.message);
          }
          render();
          return { closingSpeedKmh: current.result.closingKmh, netFinalVelocityKmh: current.result.netFinalKmh, averageContactForceN: current.result.forceDuration, compressionEstimateN: current.result.forceDistance };
        }
      })).catch(() => {});
    } catch (_) { /* The calculator still works in browsers without WebMCP. */ }
  }
})();

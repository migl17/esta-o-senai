// ============================================================
// Horta Automatizada - Simulação pura (sem servidor, sem Arduino)
// ============================================================

// ---------- Elementos ----------
const elTemp   = document.getElementById('valTemp');
const elHum    = document.getElementById('valHum');
const ledIrrig = document.getElementById('ledIrrigacao');
const ledVent  = document.getElementById('ledVentilacao');
const ledErro  = document.getElementById('ledErro');

const btnIrrigOn  = document.getElementById('btnIrrigOn');
const btnIrrigOff = document.getElementById('btnIrrigOff');
const btnVentOn   = document.getElementById('btnVentOn');
const btnVentOff  = document.getElementById('btnVentOff');
const btnAuto     = document.getElementById('btnAuto');
const btnManual   = document.getElementById('btnManual');

const aviso     = document.getElementById('aviso');
const msgAuto   = document.getElementById('msgAuto');

// ---------- Painel Dev ----------
const devPanel  = document.getElementById('dev-panel');
const devTempIn = document.getElementById('devTemp');
const devHumIn  = document.getElementById('devHum');
const devApply  = document.getElementById('devApply');
const devReset  = document.getElementById('devReset');
const devClose  = document.getElementById('dev-close');

let modoDev     = false;
let devTemp     = null;
let devHum      = null;

// Estado da horta (simulado)
let estado = {
  temperatura: 25,
  umidade: 60,
  irrigacao: false,
  ventilacao: false,
  erro: false,
  automatico: true
};

// Limites
const LIMITE_TEMP_MAX   = 30.0;
const LIMITE_TEMP_MIN   = 28.0;
const LIMITE_UMIDADE_MAX= 85.0;

// ---------- Funções ----------

function setLed(el, on) {
  if (!el) return;
  if (on) el.classList.add('on');
  else el.classList.remove('on');
}

function atualizarBloqueio() {
  const bloqueado = estado.temperatura >= LIMITE_TEMP_MAX || estado.umidade >= LIMITE_UMIDADE_MAX;
  btnIrrigOn.disabled  = bloqueado;
  btnVentOn.disabled   = bloqueado;

  if (bloqueado) {
    aviso.className = 'aviso bloqueado';
    aviso.textContent = '⚠ Limite excedido! Botões de ligar bloqueados por segurança.';
  } else {
    aviso.className = 'aviso';
    aviso.textContent = '';
  }
  return bloqueado;
}

function renderizar() {
  // Valores exibidos (modo dev sobrescreve)
  const t = modoDev && devTemp !== null ? devTemp : estado.temperatura;
  const h = modoDev && devHum  !== null ? devHum  : estado.umidade;

  elTemp.textContent = t.toFixed(1) + ' °C';
  elHum.textContent  = h.toFixed(1) + ' %';

  // Cores vermelhas quando em modo dev
  if (elTemp) {
    if (modoDev) {
      elTemp.style.color = '#c33';
      elHum.style.color  = '#c33';
    } else {
      elTemp.style.color = '';
      elHum.style.color  = '';
    }
  }

  // LEDs
  setLed(ledIrrig, estado.irrigacao);
  setLed(ledVent,  estado.ventilacao);
  setLed(ledErro,  estado.erro);

  // Bloqueio
  const bloqueado = atualizarBloqueio();

  // Mensagem automação
  if (estado.automatico) {
    if (estado.ventilacao) {
      msgAuto.textContent = '🌀 Ventoinha ligada automaticamente (temperatura alta)';
      msgAuto.style.color = '#1a6b1a';
    } else {
      msgAuto.textContent = 'Modo automático ativo';
      msgAuto.style.color = '#333';
    }
  } else {
    msgAuto.textContent = 'Modo manual';
    msgAuto.style.color = '#666';
  }

  // Visual modo dev
  if (devPanel) {
    if (modoDev) devPanel.classList.add('ativo');
    else devPanel.classList.remove('ativo');
  }
}

// ---------- Simulação automática de sensores ----------
// Variação suave (não salta aleatoriamente)
let direcaoTemp = 1;   // 1 = subindo, -1 = descendo
let direcaoHum  = 1;

function simularSensores() {
  if (modoDev) return; // no modo dev, não altera valores automaticamente

  // Temperatura: sobe/desce devagar entre 20 e 35 °C
  estado.temperatura += direcaoTemp * (0.3 + Math.random() * 0.4);
  if (estado.temperatura >= 34) direcaoTemp = -1;
  if (estado.temperatura <= 21) direcaoTemp = 1;

  // Umidade do solo: sobe/desce devagar entre 30 e 90 %
  estado.umidade += direcaoHum * (0.5 + Math.random() * 0.6);
  if (estado.umidade >= 88) direcaoHum = -1;
  if (estado.umidade <= 30) direcaoHum = 1;

  // Erro: chance baixa
  estado.erro = Math.random() < 0.02;

  // Lógica automática
  if (estado.automatico) {
    if (estado.temperatura >= LIMITE_TEMP_MAX) {
      estado.ventilacao = true;
    } else if (estado.temperatura <= LIMITE_TEMP_MIN) {
      estado.ventilacao = false;
    }
    if (estado.umidade >= LIMITE_UMIDADE_MAX) {
      estado.irrigacao = false;
    }
  }

  renderizar();
}

// Atualiza sensores a cada 1 segundo
setInterval(simularSensores, 1000);

// ---------- Painel Dev ----------
function toggleDev() {
  if (!devPanel) return;
  modoDev = !modoDev;
  devPanel.classList.toggle('hidden');
  if (!modoDev) {
    devTemp = null;
    devHum = null;
    if (devTempIn) devTempIn.value = '';
    if (devHumIn) devHumIn.value = '';
    renderizar();
  }
}

window.addEventListener('keydown', (e) => {
  const isShortcut = (e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyD';
  if (isShortcut) {
    e.preventDefault();
    toggleDev();
  }
});

// Botão flutuante Dev
const btnDevFloat = document.createElement('button');
btnDevFloat.id = 'btn-dev-float';
btnDevFloat.textContent = '🛠 DEV';
btnDevFloat.style.cssText = `
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 9999;
  background: #c33;
  color: #fff;
  border: 3px solid #fff;
  border-radius: 8px;
  padding: 12px 16px;
  font-family: inherit;
  font-weight: 900;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 6px 12px rgba(0,0,0,0.4);
`;
btnDevFloat.onclick = (e) => {
  e.preventDefault();
  toggleDev();
};
document.body.appendChild(btnDevFloat);

if (devClose) devClose.addEventListener('click', () => toggleDev());

if (devApply) {
  devApply.addEventListener('click', () => {
    const t = parseFloat(devTempIn.value);
    const h = parseFloat(devHumIn.value);
    if (!isNaN(t)) devTemp = t;
    if (!isNaN(h)) devHum = h;
    renderizar();
  });
}

if (devReset) {
  devReset.addEventListener('click', () => {
    devTemp = null;
    devHum = null;
    if (devTempIn) devTempIn.value = '';
    if (devHumIn) devHumIn.value = '';
    renderizar();
  });
}

// ---------- Controles manuais ----------
if (btnIrrigOn)  btnIrrigOn.addEventListener('click', () => { estado.irrigacao = true;  estado.automatico = false; renderizar(); });
if (btnIrrigOff) btnIrrigOff.addEventListener('click', () => { estado.irrigacao = false; estado.automatico = false; renderizar(); });

if (btnVentOn)  btnVentOn.addEventListener('click', () => { estado.ventilacao = true;  estado.automatico = false; renderizar(); });
if (btnVentOff) btnVentOff.addEventListener('click', () => { estado.ventilacao = false; estado.automatico = false; renderizar(); });

if (btnAuto)  btnAuto.addEventListener('click',  () => { estado.automatico = true;  renderizar(); });
if (btnManual) btnManual.addEventListener('click', () => { estado.automatico = false; renderizar(); });

// Inicial
renderizar();

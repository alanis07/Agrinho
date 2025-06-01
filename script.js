// script.js

// Dados iniciais
const plantacaoEl = document.getElementById('plantacao');
const moedasEl = document.getElementById('moedas');
const inventarioEl = document.getElementById('inventario');
const lojaEl = document.getElementById('loja');

let moedas = 0;
let sementesDisponiveis = [
  {nome: 'Milho 🌽', tempoColheita: 7000, valor: 1, emoji: '🌽', qtd: 10, preco: 0, compradas: 0},
  {nome: 'Feijão 🌱', tempoColheita: 9000, valor: 2, emoji: '🌱', qtd: 10, preco: 0, compradas: 0}
];
let sementesLoja = [
  {nome: 'Abóbora 🎃', preco: 3, emoji: '🎃', qtd: 5},
  {nome: 'Morango 🍓', preco: 5, emoji: '🍓', qtd: 5},
  {nome: 'Tomate 🍅', preco: 2, emoji: '🍅', qtd: 5},
  {nome: 'Melancia 🍉', preco: 6, emoji: '🍉', qtd: 5},
];

let ferramentas = {
  preco: 20,
  estoque: 0,
  usando: false,
  maxUsos: 2,
  usosRestantes: 0,
};

let fertilizantes = {
  preco: 55,
  estoque: 0,
  maxUsos: 3,
  usosRestantes: 0,
};

let usandoFerramenta = false;
let usandoFertilizante = false;
let selecaoParaFerramenta = [];
let selecaoParaFertilizante = [];

function atualizarMoedas() {
  moedasEl.textContent = moedas;
}

function mostrarAviso(msg) {
  alert(msg);
}

function criarSementeObj(semente, loja = false) {
  let div = document.createElement('div');
  div.classList.add('planta');
  div.textContent = semente.emoji;
  div.title = semente.nome;

  // Estado da planta
  div.estado = 'plantada'; // 'plantada', 'crescendo', 'pronta'
  div.timerId = null;
  div.tempoRestante = semente.tempoColheita;
  div.valor = semente.valor || 2; // valor ao colher
  div.sementeInfo = semente;

  // Começar o crescimento
  function iniciarCrescimento() {
    div.estado = 'crescendo';
    let tempo = div.tempoRestante;
    if (ferramentas.usando && selecaoParaFerramenta.includes(div)) {
      // se acelerada pela ferramenta
      tempo = tempo / 2;
    }
    div.timerId = setTimeout(() => {
      div.estado = 'pronta';
      div.style.backgroundColor = '#a6d785'; // muda a cor para indicar pronta
    }, tempo);
  }

  // Se já for usada na ferramenta, aplicar efeito
  if (ferramentas.usando && selecaoParaFerramenta.includes(div)) {
    div.tempoRestante /= 2;
  }

  iniciarCrescimento();

  // Clique na planta
  div.onclick = () => {
    if (usandoFerramenta) {
      if (selecaoParaFerramenta.length >= ferramentas.maxUsos) {
        mostrarAviso(`Você só pode usar a ferramenta em até ${ferramentas.maxUsos} sementes.`);
        return;
      }
      if (!selecaoParaFerramenta.includes(div)) {
        selecaoParaFerramenta.push(div);
        div.style.border = '3px solid #2e7d32';
      } else {
        // desmarcar
        selecaoParaFerramenta = selecaoParaFerramenta.filter(p => p !== div);
        div.style.border = '';
      }
      return;
    }
    if (usandoFertilizante) {
      if (selecaoParaFertilizante.length >= fertilizantes.maxUsos) {
        mostrarAviso(`Você só pode usar o fertilizante em até ${fertilizantes.maxUsos} sementes.`);
        return;
      }
      if (!selecaoParaFertilizante.includes(div)) {
        selecaoParaFertilizante.push(div);
        div.style.border = '3px solid #f57f17';
      } else {
        selecaoParaFertilizante = selecaoParaFertilizante.filter(p => p !== div);
        div.style.border = '';
      }
      return;
    }

    // Se planta pronta, colher
    if (div.estado === 'pronta') {
      moedas += div.valor;
      atualizarMoedas();
      clearTimeout(div.timerId);
      // resetar planta para crescer de novo
      div.estado = 'plantada';
      div.style.backgroundColor = '#e0ffe5';
      div.tempoRestante = div.sementeInfo.tempoColheita;
      iniciarCrescimento();
    }
  };

  return div;
}

function atualizarInventario() {
  inventarioEl.innerHTML = `<strong>Inventário:</strong> Ferramentas: ${ferramentas.estoque} | Fertilizantes: ${fertilizantes.estoque}`;
}

function mostrarPlantacao() {
  plantacaoEl.innerHTML = '';
  sementesDisponiveis.forEach(semente => {
    if (semente.qtd > 0) {
      for (let i = 0; i < semente.qtd; i++) {
        let planta = criarSementeObj(semente);
        plantacaoEl.appendChild(planta);
      }
    }
  });
}

function comprarItem(item, tipo) {
  if (moedas < item.preco) {
    mostrarAviso('Você não tem moedas suficientes!');
    return;
  }
  moedas -= item.preco;
  atualizarMoedas();

  if (tipo === 'semente') {
    // Adiciona sementes à plantação
    let encontrada = sementesDisponiveis.find(s => s.nome === item.nome);
    if (encontrada) {
      encontrada.qtd += 5;
    } else {
      sementesDisponiveis.push({
        nome: item.nome,
        tempoColheita: getTempoColheita(item.nome),
        valor: getValorColheita(item.nome),
        emoji: item.emoji,
        qtd: 5,
        preco: item.preco,
        compradas: 0,
      });
    }
    atualizarLoja();
    mostrarPlantacao();
  } else if (tipo === 'ferramenta') {
    ferramentas.estoque++;
    atualizarInventario();
  } else if (tipo === 'fertilizante') {
    fertilizantes.estoque++;
    atualizarInventario();
  }
}

function getTempoColheita(nome) {
  switch (nome) {
    case 'Abóbora 🎃': return 15000;
    case 'Morango 🍓': return 8000;
    case 'Tomate 🍅': return 6000;
    case 'Melancia 🍉': return 20000;
    default: return 7000;
  }
}

function getValorColheita(nome) {
  switch (nome) {
    case 'Abóbora 🎃': return 4;
    case 'Morango 🍓': return 6;
    case 'Tomate 🍅': return 3;
    case 'Melancia 🍉': return 7;
    default: return 2;
  }
}

function atualizarLoja() {
  lojaEl.innerHTML = '<h3>🛒 Loja</h3>';

  sementesLoja.forEach(item => {
    if (item.qtd > 0) {
      const btn = document.createElement('button');
      btn.textContent = `${item.emoji} ${item.nome} - ${item.preco} moedas (Restam: ${item.qtd})`;
      btn.onclick = () => {
        if (item.qtd <= 0) {
          mostrarAviso('Este item não está mais disponível para compra.');
          return;
        }
        comprarItem(item, 'semente');
        item.qtd--;
        if (item.qtd === 0) {
          atualizarLoja();
        }
      };
      lojaEl.appendChild(btn);
    }
  });

  // Ferramenta
  const btnFerramenta = document.createElement('button');
  btnFerramenta.textContent = `🛠️ Ferramenta - ${ferramentas.preco} moedas (Estoque: ${ferramentas.estoque})`;
  btnFerramenta.onclick = () => {
    if (moedas < ferramentas.preco) {
      mostrarAviso('Moedas insuficientes para comprar ferramenta.');
      return;
    }
    comprarItem({nome: 'Ferramenta', preco: ferramentas.preco}, 'ferramenta');
  };
  lojaEl.appendChild(btnFerramenta);

  // Fertilizante
  const btnFertilizante = document.createElement('button');
  btnFertilizante.textContent = `🌿 Fertilizante - ${fertilizantes.preco} moedas (Estoque: ${fertilizantes.estoque})`;
  btnFertilizante.onclick = () => {
    if (moedas < fertilizantes.preco) {
      mostrarAviso('Moedas insuficientes para comprar fertilizante.');
      return;
    }
    comprarItem({nome: 'Fertilizante', preco: fertilizantes.preco}, 'fertilizante');
  };
  lojaEl.appendChild(btnFertilizante);

  // Botões para usar ferramenta e fertilizante
  const usarFerramentaBtn = document.createElement('button');
  usarFerramentaBtn.textContent = 'Usar Ferramenta';
  usarFerramentaBtn.onclick = () => {
    if (ferramentas.estoque <= 0) {
      mostrarAviso('Você não tem ferramentas para usar.');
      return;
    }
    usandoFerramenta = true;
    usandoFertilizante = false;
    selecaoParaFerramenta = [];
    selecaoParaFertilizante = [];
    mostrarAviso(`Selecione até ${ferramentas.maxUsos} sementes para acelerar o crescimento.`);
  };
  lojaEl.appendChild(usarFerramentaBtn);

  const usarFertilizanteBtn = document.createElement('button');
  usarFertilizanteBtn.textContent = 'Usar Fertilizante';
  usarFertilizanteBtn.onclick = () => {
    if (fertilizantes.estoque <= 0) {
      mostrarAviso('Você não tem fertilizantes para usar.');
      return;
    }
    usandoFertilizante = true;
    usandoFerramenta = false;
    selecaoParaFertilizante = [];
    selecaoParaFerramenta = [];
    mostrarAviso(`Selecione até ${fertilizantes.maxUsos} sementes para receber bônus de moedas.`);
  };
  lojaEl.appendChild(usarFertilizanteBtn);

  // Botão confirmar ação
  const confirmarBtn = document.createElement('button');
  confirmarBtn.textContent = 'Confirmar Ação';
  confirmarBtn.onclick = () => {
    if (usandoFerramenta) {
      if (selecaoParaFerramenta.length === 0) {
        mostrarAviso('Selecione sementes para aplicar a ferramenta.');
        return;
      }
      // Aplica ferramenta: reduz o tempo de colheita dessas sementes pela metade
      selecaoParaFerramenta.forEach(planta => {
        clearTimeout(planta.timerId);
        planta.tempoRestante /= 2;
        planta.estado = 'plantada';
        planta.style.backgroundColor = '#d3f9d8';
        planta.timerId = setTimeout(() => {
          planta.estado = 'pronta';
          planta.style.backgroundColor = '#a6d785';
        }, planta.tempoRestante);
        planta.style.border = '';
      });
      ferramentas.estoque--;
      atualizarInventario();
      usandoFerramenta = false;
      selecaoParaFerramenta = [];
    } else if (usandoFertilizante) {
      if (selecaoParaFertilizante.length === 0) {
        mostrarAviso('Selecione sementes para aplicar o fertilizante.');
        return;
      }
      // Aplica fertilizante: ganha 100 moedas + remove planta
      moedas += 100;
      atualizarMoedas();
      selecaoParaFertilizante.forEach(planta => {
        planta.remove();
      });
      fertilizantes.estoque--;
      atualizarInventario();
      usandoFertilizante = false;
      selecaoParaFertilizante = [];
    } else {
      mostrarAviso('Nenhuma ação selecionada.');
    }
  };
  lojaEl.appendChild(confirmarBtn);
}

function init() {
  atualizarMoedas();
  atualizarInventario();
  mostrarPlantacao();
  atualizarLoja();
}

init();
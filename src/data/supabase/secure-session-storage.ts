import * as SecureStore from 'expo-secure-store';

/**
 * Armazenamento da sessão do Supabase no Keychain (iOS) / Keystore (Android).
 *
 * O expo-secure-store guarda valores pequenos; a sessão do Supabase (JWT +
 * refresh token) passa desse limite. Em vez de trazer uma biblioteca de
 * criptografia só para cifrar o valor e guardá-lo no AsyncStorage — que fica em
 * texto claro no dispositivo (OWASP M9) —, o valor é fatiado e cada pedaço vai
 * para o armazenamento seguro da plataforma.
 *
 * O índice `<chave>.n` guarda quantos pedaços existem. Ler sem esse índice, ou
 * com um pedaço faltando, devolve null: a sessão é descartada e o usuário
 * refaz o login. É o comportamento seguro diante de um estado corrompido.
 */
const TAMANHO_DO_PEDACO = 1800;

function chaveDoIndice(chave: string): string {
  return `${chave}.n`;
}

function chaveDoPedaco(chave: string, indice: number): string {
  return `${chave}.${indice.toString()}`;
}

async function limparPedacos(chave: string, quantidade: number): Promise<void> {
  for (let i = 0; i < quantidade; i += 1) {
    await SecureStore.deleteItemAsync(chaveDoPedaco(chave, i));
  }
}

async function lerQuantidade(chave: string): Promise<number> {
  const bruto = await SecureStore.getItemAsync(chaveDoIndice(chave));

  if (bruto === null) {
    return 0;
  }

  const quantidade = Number.parseInt(bruto, 10);

  return Number.isFinite(quantidade) && quantidade > 0 ? quantidade : 0;
}

export const secureSessionStorage = {
  async getItem(chave: string): Promise<string | null> {
    const quantidade = await lerQuantidade(chave);

    if (quantidade === 0) {
      return null;
    }

    const pedacos: string[] = [];

    for (let i = 0; i < quantidade; i += 1) {
      const pedaco = await SecureStore.getItemAsync(chaveDoPedaco(chave, i));

      if (pedaco === null) {
        await this.removeItem(chave);

        return null;
      }

      pedacos.push(pedaco);
    }

    return pedacos.join('');
  },

  async setItem(chave: string, valor: string): Promise<void> {
    const quantidadeAnterior = await lerQuantidade(chave);
    const pedacos: string[] = [];

    for (let i = 0; i < valor.length; i += TAMANHO_DO_PEDACO) {
      pedacos.push(valor.slice(i, i + TAMANHO_DO_PEDACO));
    }

    for (const [indice, pedaco] of pedacos.entries()) {
      await SecureStore.setItemAsync(chaveDoPedaco(chave, indice), pedaco);
    }

    // Pedaços sobrando de uma sessão maior anterior não podem ficar para trás.
    for (let i = pedacos.length; i < quantidadeAnterior; i += 1) {
      await SecureStore.deleteItemAsync(chaveDoPedaco(chave, i));
    }

    await SecureStore.setItemAsync(chaveDoIndice(chave), pedacos.length.toString());
  },

  async removeItem(chave: string): Promise<void> {
    const quantidade = await lerQuantidade(chave);

    await limparPedacos(chave, quantidade);
    await SecureStore.deleteItemAsync(chaveDoIndice(chave));
  },
};

import { useState } from 'react';
import { Text, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

/**
 * Player oficial do YouTube embutido (IFrame API dentro de uma WebView).
 *
 * Os Termos de Serviço do YouTube proíbem download, extração de áudio e
 * esconder os controles do player — por isso o vídeo é sempre reproduzido pelo
 * componente oficial, e não por um tocador próprio.
 */
export function VideoPlayer({
  videoId,
  altura = 200,
  play = false,
  onMudarEstado,
}: {
  videoId: string;
  altura?: number;
  play?: boolean;
  onMudarEstado?: (estado: string) => void;
}) {
  const [erro, setErro] = useState<string | null>(null);

  if (erro !== null) {
    return (
      <View
        accessibilityRole="alert"
        className="items-center justify-center rounded-xl bg-neutral-100 p-4 dark:bg-neutral-900"
        style={{ height: altura }}
      >
        <Text className="text-center text-sm text-neutral-600 dark:text-neutral-400">{erro}</Text>
      </View>
    );
  }

  return (
    <View accessibilityLabel="Vídeo de referência" className="overflow-hidden rounded-xl">
      <YoutubePlayer
        height={altura}
        videoId={videoId}
        play={play}
        onChangeState={onMudarEstado}
        onError={() => {
          setErro('Não foi possível carregar o vídeo.');
        }}
      />
    </View>
  );
}

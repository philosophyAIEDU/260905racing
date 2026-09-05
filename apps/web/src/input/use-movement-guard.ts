import { useEffect, useState } from 'react';
import { useGame } from '../state/game-store';

export function useMovementGuard(): string {
  const enabled = useGame((s) => s.preferences.movementGuard);
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (!enabled) {
      useGame.getState().setGuardBlocked(false);
      setMessage('');
      return;
    }
    if (!navigator.geolocation) {
      setMessage('이 기기는 이동 감지를 지원하지 않습니다.');
      return;
    }
    const watch = navigator.geolocation.watchPosition(
      (position) => {
        const speed = position.coords.speed;
        if (speed === null || !Number.isFinite(speed)) {
          setMessage('이동 속도를 확인할 수 없습니다.');
          return;
        }
        const blocked = speed > 2.8;
        useGame.getState().setGuardBlocked(blocked);
        setMessage(
          blocked ? '이동이 감지되어 주행을 멈췄습니다. 안전한 장소에서 이용해 주세요.' : '',
        );
      },
      () => {
        setMessage('위치 권한을 확인해 주세요. 이동 감지가 작동하지 않습니다.');
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
    );
    return () => {
      navigator.geolocation.clearWatch(watch);
    };
  }, [enabled]);
  return message;
}

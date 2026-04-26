import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

// Cold-open (push'tan açılış) anında NavigationContainer henüz hazır olmamış
// olabilir; ready olana kadar kısa bir retry penceresi açıyoruz.
export function safeNavigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
    return;
  }
  let tries = 0;
  const interval = setInterval(() => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(name, params);
      clearInterval(interval);
    } else if (++tries > 20) {
      clearInterval(interval);
    }
  }, 100);
}

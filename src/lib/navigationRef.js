import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

// NavigationContainer henüz mount değilken (örn. Splash sırasında push'tan
// cold-open) gelen navigasyon istekleri buraya kuyruklanır; container
// ready olunca App.js içindeki onReady -> flushPendingNavigation tetikler.
let pendingNavigation = null;

export function safeNavigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
    return;
  }
  // En son istek geçerli — birden fazla push gelmişse sonuncuya yönlendir.
  pendingNavigation = { name, params };
}

export function flushPendingNavigation() {
  if (pendingNavigation && navigationRef.isReady()) {
    const { name, params } = pendingNavigation;
    pendingNavigation = null;
    navigationRef.navigate(name, params);
  }
}

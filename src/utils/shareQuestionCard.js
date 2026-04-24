import { Share as NativeShare } from 'react-native';
import Share from 'react-native-share';
import { captureRef } from 'react-native-view-shot';

const waitForPaint = () =>
  new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });

const isCancelError = (error) => {
  const message = String(error?.message || error?.error || error || '').toLowerCase();
  return (
    message.includes('cancel') ||
    message.includes('dismiss') ||
    message.includes('did not share')
  );
};

export const shareQuestionCard = async ({
  cardRef,
  message,
  title = 'KartOyunu',
  filename = 'kartoyunu-soru',
}) => {
  let imageUri = null;

  try {
    if (cardRef?.current) {
      await waitForPaint();
      imageUri = await captureRef(cardRef, {
        format: 'jpg',
        quality: 0.95,
        result: 'tmpfile',
      });
    }
  } catch {
    imageUri = null;
  }

  if (imageUri) {
    try {
      await Share.open({
        title,
        message,
        url: imageUri,
        type: 'image/jpeg',
        filename: `${filename}.jpg`,
        failOnCancel: true,
      });
      return true;
    } catch (error) {
      if (isCancelError(error)) return false;
      // Fall back to text-only if the image share fails unexpectedly.
    }
  }

  try {
    const result = await NativeShare.share({
      message,
      title,
    });
    return result.action === NativeShare.sharedAction;
  } catch (error) {
    if (isCancelError(error)) return false;
    return false;
  }
};

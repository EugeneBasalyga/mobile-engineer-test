declare module '*.svg' {
  import { type FC } from 'react';
  import { type SvgProps } from 'react-native-svg';

  const content: FC<SvgProps>;
  export default content;
}

declare module '*.png' {
  import { type ImageRequireSource } from 'react-native';

  const value: ImageRequireSource;
  export default value;
}

declare module '*.jpg' {
  import { type ImageRequireSource } from 'react-native';

  const value: ImageRequireSource;
  export default value;
}

declare module '*.jpeg' {
  import { type ImageRequireSource } from 'react-native';

  const value: ImageRequireSource;
  export default value;
}

declare module '*.gif' {
  import { type ImageRequireSource } from 'react-native';

  const value: ImageRequireSource;
  export default value;
}

declare module '*.mp4' {
  const value: number;
  export default value;
}

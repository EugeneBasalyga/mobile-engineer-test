import { type FC } from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
import { useUnistyles } from 'react-native-unistyles';

const Apple: FC<SvgProps> = ({ color: colorProp, height = 24, width = 24, ...props }) => {
  const { theme } = useUnistyles();

  const color = colorProp ?? theme.shared.icon.primary;

  return (
    <Svg color={color} fill="none" height={height} viewBox="0 0 24 24" width={width} {...props}>
      <Path
        d="M17.91 11.798c-.01-1.72.767-3.018 2.338-3.975-.88-1.26-2.207-1.954-3.96-2.09-1.66-.131-3.473.97-4.137.97-.701 0-2.31-.923-3.571-.923-2.609.042-5.38 2.086-5.38 6.243 0 1.229.224 2.499.672 3.807.599 1.72 2.758 5.939 5.012 5.868 1.178-.028 2.01-.839 3.543-.839 1.487 0 2.258.84 3.571.84 2.272-.033 4.226-3.868 4.796-5.593-3.047-1.439-2.884-4.219-2.884-4.308Zm-2.646-7.696c1.277-1.52 1.16-2.902 1.122-3.399-1.126.066-2.43.769-3.174 1.636-.818.928-1.3 2.077-1.196 3.37 1.22.094 2.332-.534 3.248-1.607Z"
        fill="currentColor"
      />
    </Svg>
  );
};

export default Apple;

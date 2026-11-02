import { type FC } from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
import { useUnistyles } from 'react-native-unistyles';

const Check: FC<SvgProps> = ({ color: colorProp, height = 24, width = 24, ...props }) => {
  const { theme } = useUnistyles();

  const color = colorProp ?? theme.shared.icon.primary;

  return (
    <Svg color={color} fill="none" height={height} viewBox="0 0 24 24" width={width} {...props}>
      <Path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Svg>
  );
};

export default Check;

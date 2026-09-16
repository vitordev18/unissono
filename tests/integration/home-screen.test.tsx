import { render, screen } from '@testing-library/react-native';

import HomeScreen from '../../app/index';

describe('HomeScreen', () => {
  it('renderiza o nome do app', async () => {
    await render(<HomeScreen />);

    expect(screen.getByText('Uníssono')).toBeOnTheScreen();
  });
});

import { useAppDispatch } from 'app/Hooks';
import { submitButton } from 'features/game/GameSlice';
import styles from './EndGameMenuOptions.module.css';
import { useState } from 'react';
import { PROCESS_INPUT } from 'appConstants';
import { useNavigate } from 'react-router-dom';

const EndGameMenuOptions = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [hasRated, setHasRated] = useState(false);

  // TODO: Need constants for the button modes.
  const handleMainMenu = async () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.MAIN_MENU } }));
    navigate('/');
  };

  const handleQuickRematch = () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.QUICK_REMATCH } }));
  };

  const handleFullRematch = () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.FULL_REMATCH } }));
    // TODO: Redirect to sideboard screen if opponent has also elected for a full rematch.
  };

  return (
    <div className={styles.container}>
      <div className={styles.buttons}>
        <div className={styles.buttonDiv} onClick={handleMainMenu}>
          Main Menu
        </div>
        <div className={styles.buttonDiv} onClick={handleQuickRematch}>
          Quick Rematch (no sideboarding)
        </div>
        <div className={styles.buttonDiv} onClick={handleFullRematch}>
          Full Rematch (new sideboard)
        </div>
      </div>
    </div>
  );
};

export default EndGameMenuOptions;

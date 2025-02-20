import React, { useEffect, useState } from 'react';
import { submitButton, submitMultiButton } from 'features/game/GameSlice';
import { useAppSelector, useAppDispatch } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './PlayerInputPopUp.module.css';
import Button from 'features/Button';
import { FaTimes } from 'react-icons/fa';
import CardDisplay from '../cardDisplay/CardDisplay';
import SearchCardInput from '../searchCardInput';
import { PROCESS_INPUT } from 'appConstants';
import { NAME_A_CARD } from './constants';
import { motion, AnimatePresence } from 'framer-motion';
import useShowModal from 'hooks/useShowModals';

export default function PlayerInputPopUp() {
  const showModal = useShowModal();
  const inputPopUp = useAppSelector(
    (state: RootState) => state.game.playerInputPopUp
  );

  const [checkedState, setCheckedState] = useState(
    new Array(inputPopUp?.multiChooseText?.length).fill(false)
  );

  useEffect(() => {
    const cardsArrLength =
      inputPopUp?.popup?.cards?.length !== undefined
        ? inputPopUp?.popup?.cards?.length
        : 0;
    const optionsArrLength =
      inputPopUp?.multiChooseText?.length !== undefined
        ? inputPopUp?.multiChooseText?.length
        : 0;
    const checkBoxLength = Math.max(cardsArrLength, optionsArrLength);
    setCheckedState(new Array(checkBoxLength).fill(false));
  }, [inputPopUp]);

  const dispatch = useAppDispatch();

  const onPassTurn = () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.PASS } }));
  };

  const clickButton = (button: Button) => {
    dispatch(submitButton({ button: button }));
  };

  if (
    !showModal ||
    inputPopUp === undefined ||
    inputPopUp.active === undefined ||
    inputPopUp.active == false
  ) {
    return null;
  }

  const title = { __html: inputPopUp.popup?.title ?? '' };

  const checkBoxSubmit = () => {
    let extraParams = `&chkCount=${checkedState.length}`;
    if (inputPopUp.multiChooseText) {
      for (let i = 0; i < checkedState.length; i++) {
        if (inputPopUp.multiChooseText[i]) {
          extraParams += checkedState[i]
            ? `&chk${i}=${inputPopUp.multiChooseText[i].value}`
            : '';
        }
      }
    }
    if (inputPopUp.popup?.cards) {
      for (let i = 0; i < checkedState.length; i++) {
        if (inputPopUp.popup.cards[i]) {
          extraParams += checkedState[i]
            ? `&chk${i}=${inputPopUp.popup.cards[i].actionDataOverride}`
            : '';
        }
      }
    }
    dispatch(
      submitMultiButton({
        mode: inputPopUp.formOptions?.mode,
        extraParams: extraParams
      })
    );
  };

  const buttons = inputPopUp.buttons?.map((button, ix) => {
    return (
      <div
        className={styles.buttonDiv}
        onClick={() => {
          clickButton(button);
        }}
        key={ix.toString()}
      >
        {button.caption}
      </div>
    );
  });

  // cards
  const selectCard = inputPopUp.popup?.cards?.map((card, ix) => {
    return inputPopUp.choiceOptions == 'checkbox' ? (
      <div
        key={ix.toString()}
        className={styles.cardDiv}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleCheckBoxChange(Number(card.actionDataOverride));
        }}
      >
        <CardDisplay
          card={{ borderColor: checkedState[ix] ? '8' : '', ...card }}
          preventUseOnClick
        />
      </div>
    ) : (
      <div className={styles.cardDiv} key={ix.toString()}>
        <CardDisplay card={card} />
      </div>
    );
  });

  const handleCheckBoxChange = (pos: number | undefined) => {
    if (pos === undefined) {
      return;
    }
    const updatedCheckedState = checkedState.map((item, index) =>
      index === pos ? !item : item
    );
    setCheckedState(updatedCheckedState);
  };

  const checkboxes = inputPopUp.multiChooseText?.map((option, ix) => {
    return (
      <div key={ix} className={styles.checkBoxRow}>
        <label className={styles.checkBoxLabel}>
          <input
            type="checkbox"
            id={`multi-choose-text-${String(option.input)}`}
            name={option.label}
            value={checkedState[ix]}
            onChange={() => handleCheckBoxChange(option.input)}
            className={styles.checkBox}
          />
          {option.label}
        </label>
      </div>
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      key="playerInputPopupBox"
      className={styles.optionsContainer}
    >
      <div className={styles.optionsTitleContainer}>
        <div className={styles.optionsTitle}>
          <h3 className={styles.title} dangerouslySetInnerHTML={title}></h3>
          {inputPopUp.popup?.additionalComments}
        </div>
        {inputPopUp.popup?.canClose ? (
          <div className={styles.inputPopUpCloseIcon} onClick={onPassTurn}>
            <FaTimes title="close popup" />
          </div>
        ) : null}
      </div>
      <div className={styles.contentContainer}>
        <form className={styles.form}>
          {selectCard?.length != 0 ? (
            <div className={styles.cardList}>{selectCard}</div>
          ) : null}
          {buttons?.length != 0 ? (
            <div className={styles.buttonList}>{buttons}</div>
          ) : null}
          <div>
            {inputPopUp.formOptions ? (
              <div>
                {checkboxes?.length != 0 ? <div>{checkboxes}</div> : null}
                <div
                  className={styles.buttonDiv}
                  onClick={() => {
                    checkBoxSubmit();
                  }}
                >
                  {inputPopUp.formOptions.caption}
                </div>
              </div>
            ) : null}
            {inputPopUp?.popup?.id === NAME_A_CARD && <SearchCardInput />}
          </div>
        </form>
      </div>
    </motion.div>
  );
}

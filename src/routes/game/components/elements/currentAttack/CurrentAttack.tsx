import React from 'react';
import { RootState } from 'app/Store';
import { BiBullseye, BiTargetLock } from 'react-icons/bi';
import { GiZigzagLeaf, GiElectric, GiCycle, GiShield } from 'react-icons/gi';
import styles from './CurrentAttack.module.css';
import attackSymbol from '../../../../../img/symbols/symbol-attack.png';
import defSymbol from '../../../../../img/symbols/symbol-defence.png';
import CardDisplay from '../cardDisplay/CardDisplay';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { showChainLinkSummary } from 'features/game/GameSlice';

export default function CurrentAttack() {
  const activeCombatChain = useAppSelector(
    (state: RootState) => state.game.activeChainLink
  );
  const dispatch = useAppDispatch();
  if (
    activeCombatChain === undefined ||
    activeCombatChain.attackingCard === undefined ||
    activeCombatChain.attackingCard.cardNumber === 'blank'
  ) {
    return <div className={styles.currentAttack} />;
  }
  const attackZoneDisplay = () => {
    dispatch(showChainLinkSummary({ chainLink: -1 }));
  };

  const attackValue = activeCombatChain.totalAttack;
  const defValue = activeCombatChain.totalDefence;
  const attCard = activeCombatChain.attackingCard;

  return (
    <div className={styles.currentAttack}>
      <div className={styles.attDefRow}>
        <div className={styles.attDiv} data-testid="attack-value">
          {attackValue}
        </div>
        <div className={styles.attackSymbol} onClick={attackZoneDisplay}>
          <img
            className={styles.chainSymbols}
            src={attackSymbol}
            alt="attack symbol"
          />
        </div>
        <div className={styles.attackSymbol}>
          <img
            className={styles.chainSymbols}
            src={defSymbol}
            alt="defence symbol"
          />
        </div>
        <div className={styles.defDiv} data-testid="defence-value">
          {defValue}
        </div>
        {activeCombatChain.attackTarget ? (
          <div className={styles.icon} data-tooltip={`Attack target: ${activeCombatChain.attackTarget}`}>
            <BiTargetLock />
          </div>
        ) : null}
      </div>
      <div className={styles.attack}>
        <CardDisplay card={attCard} />
        <div className={styles.floatCover}>
          {activeCombatChain.goAgain ? (
            <div className={styles.icon} data-tooltip="Go Again">
              <GiCycle />
            </div>
          ) : null}
          {activeCombatChain.dominate ? (
            <div className={styles.icon} data-tooltip="Dominate">
              <BiBullseye />
            </div>
          ) : null}
          {activeCombatChain.overpower ? (
            <div className={styles.icon} data-tooltip="Overpower">
              <GiElectric />
            </div>
          ) : null}
          {activeCombatChain.fused ? (
            <div className={styles.icon} data-tooltip="Fused">
              <GiZigzagLeaf />
            </div>
          ) : null}
          {activeCombatChain.damagePrevention ? (
            <div
              className={styles.icon}
              data-tooltip={`${activeCombatChain.damagePrevention} Damage Prevention`}
            >
              <GiShield />
              {activeCombatChain.damagePrevention}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

import React, { useCallback, useEffect } from 'react';
import Deck from './components/deck/Deck';
import LobbyChat from './components/lobbyChat/LobbyChat';
import testData from './mockdata.json';
import styles from './Lobby.module.css';
import Equipment from './components/equipment/Equipment';
import { useState } from 'react';
import classNames from 'classnames';
import { FaExclamationCircle } from 'react-icons/fa';
import { Form, Formik } from 'formik';
import deckValidation from './validation';
import StickyFooter from './components/stickyFooter/StickyFooter';
import {
  useGetLobbyInfoQuery,
  useSubmitSideboardMutation
} from 'features/api/apiSlice';
import { useAppSelector } from 'app/Hooks';
import { shallowEqual } from 'react-redux';
import { RootState } from 'app/Store';
import { DeckResponse, Weapon } from 'interface/API/GetLobbyInfo.php';
import LobbyUpdateHandler from './components/updateHandler/SideboardUpdateHandler';
import { GAME_FORMAT, BREAKPOINT_EXTRA_LARGE } from 'appConstants';
import ChooseFirstTurn from './components/chooseFirstTurn/ChooseFirstTurn';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { SubmitSideboardAPI } from 'interface/API/SubmitSideboard.php';
import { useNavigate } from 'react-router-dom';
import CardPortal from '../components/elements/cardPortal/CardPortal';
import Matchups from './components/matchups/Matchups';
import { GameLocationState } from 'interface/GameLocationState';
import CardPopUp from '../components/elements/cardPopUp/CardPopUp';
import { getGameInfo } from 'features/game/GameSlice';
import useSound from 'use-sound';
import playerJoined from 'sounds/playerJoinedSound.mp3';

const Lobby = () => {
  const [activeTab, setActiveTab] = useState('equipment');
  const [unreadChat, setUnreadChat] = useState(false);
  const [width, height] = useWindowDimensions();
  const [isWideScreen, setIsWideScreen] = useState(false);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { playerID, gameID, authKey } = useAppSelector(
    getGameInfo,
    shallowEqual
  );
  const gameLobby = useAppSelector(
    (state: RootState) => state.game.gameLobby,
    shallowEqual
  );
  const [playLobbyJoin] = useSound(playerJoined, { volume: 1 });

  let { data, isLoading, refetch } = useGetLobbyInfoQuery({
    gameName: gameID,
    playerID: playerID,
    authKey: authKey
  });

  const [submitSideboardMutation, submitSideboardMutationData] =
    useSubmitSideboardMutation();

  useEffect(() => {
    if (gameLobby?.theirName != undefined && gameLobby?.theirName != '') {
      playLobbyJoin();
    }
  }, [gameLobby?.theirName]);

  useEffect(() => {
    setIsWideScreen(width > BREAKPOINT_EXTRA_LARGE);
  }, [width]);

  const handleEquipmentClick = () => {
    setActiveTab('equipment');
  };

  const handleDeckClick = () => {
    setActiveTab('deck');
  };

  const handleChatClick = () => {
    setUnreadChat(false);
    setActiveTab('chat');
  };

  const handleMatchupClick = () => setActiveTab('matchups');

  const handleFormSubmission = async (values: DeckResponse) => {
    setIsSubmitting(true);
    // encode it as an object
    const deck = {
      hero: data?.deck.hero,
      hands: values.weapons.map((item) => item.id.substring(0, 6)),
      head: values.head,
      chest: values.chest,
      arms: values.arms,
      legs: values.legs,
      deck: values.deck.map((card) => card.substring(0, 6))
    };
    const requestBody: SubmitSideboardAPI = {
      gameName: gameID,
      playerID: playerID,
      authKey: authKey,
      submission: JSON.stringify(deck) // the API unmarshals the JSON inside the unmarshaled JSON.
    };

    try {
      const data: any = await submitSideboardMutation(requestBody).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (data === undefined || data === null || Object.keys(data).length === 0) {
    data = testData;
  }

  if (data === undefined || data === null) {
    return null;
  }

  // if the game is ready then let's join the main game
  if (gameLobby?.isMainGameReady) {
    const searchParam = {
      playerID: String(playerID),
      gameName: String(gameID)
    };
    navigate(`/game/play/${gameID}`, {
      state: { playerID: playerID ?? 0 } as GameLocationState
    });
  }

  // I'm not sure how I can get formik to understand checkboxes and repeating cards so give them all an index here.
  const deckIndexed = data.deck.cards.map((card, ix) => `${card}-${ix}`);
  const deckSBIndexed = data.deck.cardsSB.map(
    (card, ix) => `${card}-${ix + deckIndexed.length}`
  );

  const leftPic = `url(/crops/${
    data.deck.hero === 'CardBack' ? 'UNKNOWNHERO' : data.deck.hero
  }_cropped.png)`;
  const rightPic = `url(/crops/${
    gameLobby?.theirHero === 'CardBack' ? 'UNKNOWNHERO' : gameLobby?.theirHero
  }_cropped.png)`;

  const eqClasses = classNames({ secondary: activeTab !== 'equipment' });
  const deckClasses = classNames({ secondary: activeTab !== 'deck' });
  const chatClasses = classNames({ secondary: activeTab !== 'chat' });
  const matchupClasses = classNames({ secondary: activeTab !== 'matchups' });
  const leaveClasses = classNames('secondary outline');

  const handleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // TODO: Need a way to announce to the server that we are leaving
    navigate(`/`);
  };

  let deckSize = 60;
  switch (data.format) {
    case GAME_FORMAT.BLITZ:
    case GAME_FORMAT.COMPETITIVE_BLITZ:
    case GAME_FORMAT.COMMONER:
    case GAME_FORMAT.CLASH:
      deckSize = 40;
      break;
    case GAME_FORMAT.SEALED:
    case GAME_FORMAT.DRAFT:
      deckSize = 30;
      break;
    case GAME_FORMAT.OPEN_FORMAT:
      deckSize = 0;
      break;
    default:
  }

  const weaponsIndexed = [...data.deck.hands].map((card, ix) => {
    return {
      id: `${card.id}-${ix}`,
      is1H: card.is1H,
      img: `${card.id}`,
      numHands: card.numHands ?? (card.is1H ? 1 : 2)
    } as Weapon;
  });

  const weaponsSBIndexed = [
    ...data.deck.handsSB,
    { id: `NONE00`, is1H: true, img: `NONE00`, numHands: 2 }
  ].map((card, ix) => {
    return {
      id: `${card.id}-${ix + weaponsIndexed.length}`,
      img: `${card.id}`,
      is1H: card.is1H,
      numHands: card.numHands ?? (card.is1H ? 1 : 2)
    } as Weapon;
  });

  const mainClassNames = classNames(styles.lobbyClass);

  return (
    <main className={mainClassNames}>
      <LobbyUpdateHandler isSubmitting={isSubmitting} />
      <Formik
        initialValues={{
          deck: deckIndexed,
          weapons: weaponsIndexed,
          head: [...data.deck.head, ...data.deck.headSB, 'NONE00'][0],
          chest: [...data.deck.chest, ...data.deck.chestSB, 'NONE00'][0],
          arms: [...data.deck.arms, ...data.deck.armsSB, 'NONE00'][0],
          legs: [...data.deck.legs, ...data.deck.legsSB, 'NONE00'][0]
        }}
        onSubmit={handleFormSubmission}
        validationSchema={deckValidation(deckSize)}
        enableReinitialize
      >
        <Form className={styles.form}>
          <div className={styles.gridLayout}>
            <div className={styles.titleContainer}>
              <CardPopUp
                cardNumber={data.deck.hero}
                containerClass={styles.leftCol}
              >
                <div
                  className={styles.leftCol}
                  style={{ backgroundImage: leftPic }}
                >
                  <div className={styles.dimPic}>
                    <h3 aria-busy={isLoading}>{data.displayName}</h3>
                    <div className={styles.heroName}>{data.deck.heroName}</div>
                  </div>
                </div>
              </CardPopUp>
              <CardPopUp
                cardNumber={gameLobby?.theirHero ?? 'CardBack'}
                containerClass={styles.rightCol}
              >
                <div
                  className={styles.rightCol}
                  style={{ backgroundImage: rightPic }}
                >
                  <div className={styles.dimPic}>
                    <h3 aria-busy={!gameLobby?.theirName}>
                      {gameLobby?.theirName ?? ''}
                    </h3>
                    <div className={styles.heroName}>
                      {gameLobby?.theirHeroName != ''
                        ? gameLobby?.theirHeroName
                        : 'Waiting For Opponent'}
                    </div>
                  </div>
                </div>
              </CardPopUp>
            </div>
            {gameLobby?.amIChoosingFirstPlayer ? (
              <ChooseFirstTurn />
            ) : (
              !isWideScreen && (
                <nav>
                  <ul>
                    {!isWideScreen && (
                      <li>
                        <button
                          className={leaveClasses}
                          onClick={handleLeave}
                          type="button"
                        >
                          Leave
                        </button>
                      </li>
                    )}
                  </ul>
                  <ul>
                    {gameLobby?.matchups != undefined &&
                      gameLobby?.matchups?.length > 0 && (
                        <li>
                          <button
                            className={matchupClasses}
                            onClick={handleMatchupClick}
                            type="button"
                          >
                            Matchups
                          </button>
                        </li>
                      )}
                    <li>
                      <button
                        className={eqClasses}
                        onClick={handleEquipmentClick}
                        type="button"
                      >
                        Equipment
                      </button>
                    </li>
                    <li>
                      <button
                        className={deckClasses}
                        onClick={handleDeckClick}
                        type="button"
                      >
                        Deck
                      </button>
                    </li>
                    <li>
                      <button
                        className={chatClasses}
                        onClick={handleChatClick}
                        type="button"
                      >
                        {unreadChat && (
                          <>
                            <FaExclamationCircle />{' '}
                          </>
                        )}
                        Chat
                      </button>
                    </li>
                  </ul>
                </nav>
              )
            )}
            {(activeTab === 'equipment' || isWideScreen) && (
              <Equipment
                lobbyInfo={data}
                weapons={weaponsIndexed}
                weaponSB={weaponsSBIndexed}
              />
            )}
            {(activeTab === 'deck' || isWideScreen) && (
              <Deck deck={[...deckIndexed, ...deckSBIndexed]} />
            )}
            {(activeTab === 'chat' || isWideScreen) && <LobbyChat />}
            {(activeTab === 'matchups' || isWideScreen) && (
              <Matchups refetch={refetch} />
            )}
            {!gameLobby?.amIChoosingFirstPlayer ? (
              <StickyFooter
                deckSize={deckSize}
                submitSideboard={gameLobby?.canSubmitSideboard ?? false}
                handleLeave={handleLeave}
                isWidescreen={isWideScreen}
              />
            ) : null}
          </div>
        </Form>
      </Formik>
      <CardPortal />
    </main>
  );
};

export default Lobby;

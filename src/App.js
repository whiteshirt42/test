import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import { ProductionRaft, GerminationTray, varieties } from "./data";
import { useState } from "react";
import _ from "lodash";

// Note: there are several CSS animation thta match this speed, so you should update
//       those as well if changing this value
const GAME_SPEED = 3000;

// Initial state of the game
const INIT = {
  day: 1,
  germination: {
    trays: [],
  },
  production: [
    {
      name: "Pond 1",
      rafts: [],
    },
    {
      name: "Pond 2",
      rafts: [],
    },
    {
      name: "Pond 3",
      rafts: [],
    },
  ],
  harvested: [
    {
      name: "Romaine Lettuce",
      quantity: 10,
    },
    {
      name: "Butterhead Lettuce",
      quantity: 0,
    },
    {
      name: "Rocket Lettuce",
      quantity: 0,
    },
  ],
};

let intervalId;

export default function App() {
  const [day, setDay] = useState(INIT.day);
  const [timer, setTimer] = useState(false);
  const [germination, setGermination] = useState(INIT.germination);
  const [production, setProduction] = useState(INIT.production);
  const [harvested, setHarvested] = useState(INIT.harvested);

  /**
   * Can be used for
   */
  const gameLoop = () => {
    cycleProduction();
    resetTimer();
    setDay((day) => day + 1);
  };

  // A bit of a hack to reset the css animation on the timer
  const resetTimer = () => {
    setTimer(false);
    setTimer(true);
  };

  /**
   * Adds a new raft to each pond in production
   */
  const cycleProduction = () => {
    setProduction((production) => {
      const newProduction = _.cloneDeep(production);
      newProduction.forEach((pond) => {
        pond.rafts.unshift(new ProductionRaft());
      });
      return newProduction;
    });
  };

  /**
   * Logs the game's data objects to console
   */
  const debug = () => {
    console.log({
      day,
      germination,
      production,
      harvested,
      timer,
    });
  };

  /**
   * Transplants seedlings from the oldest seeded tray to the newest raft of the
   * selected pond.
   * @param {number} pondIndex the index of the pond to transplant to
   */

  const harvestRaftFromPond = (raft, pond, pondI, raftI) => {
    const raftCopy = _.cloneDeep(raft);
    const productionCopy = _.cloneDeep(production);
    const harvestedCopy = _.cloneDeep(harvested);
    console.log(production);
    console.log(harvested);
    console.log(raft);
    console.log(pond);
    console.log(pondI);
    console.log(raftI);
    // let pond0 = productionCopy[0];
    // let pond1 = productionCopy[1];
    // let pond2 = productionCopy[2];
    // if (pondI === 0) {
    //   pond0 = productionCopy[0].rafts.splice(raftI, 1);
    // }
    // if (pondI === 1) {
    //   pond1 = productionCopy[1].rafts.splice(raftI, 1);
    // }
    // if (pondI === 2) {
    //   pond2 = productionCopy[2].rafts.splice(raftI, 1);
    // }
    // productionCopy[0] = pond0;
    // productionCopy[1] = pond1;
    // productionCopy[2] = pond2;

    if (raft.variety.name === "Romaine Lettuce") {
      harvestedCopy[0].quantity += raft.plants;
    } else if (raft.variety.name === "Butterhead Lettuce") {
      harvestedCopy[1].quantity += raft.plants;
    } else if (raft.variety.name === "Rocket Lettuce") {
      harvestedCopy[2].quantity += raft.plants;
    }
    console.log(productionCopy);
    console.log(harvestedCopy);
    setProduction(productionCopy);
    setHarvested(harvestedCopy);
  };

  const daysToTransplant = (tray) => {
    return tray.creationDay + tray.variety.actions[0].day - day;
  };

  const transplantToPond = (pondIndex) => {
    function transplantable(tray) {
      return daysToTransplant(tray) <= 0;
    }
    const germinationCopy = _.cloneDeep(germination);
    const productionCopy = _.cloneDeep(production);

    const sourceTrayIndex = germinationCopy.trays.findIndex(transplantable);
    const sourceTray = germinationCopy.trays[sourceTrayIndex];
    const destinationRaft = productionCopy[pondIndex].rafts[0];

    if (sourceTray) {
      const plantsRequested = destinationRaft.open;
      const plantsAvailable = sourceTray.plants;
      const plantsUsed = Math.min(plantsRequested, plantsAvailable);

      sourceTray.plants -= plantsUsed;
      destinationRaft.plants += plantsUsed;

      destinationRaft.variety = sourceTray.variety;
      destinationRaft.creationDay = day;

      if (sourceTray.plants <= 0) {
        germinationCopy.trays.splice(sourceTrayIndex, 1);
      }
    }

    setGermination(germinationCopy);
    setProduction(productionCopy);
  };

  /**
   * Add a new tray to Germination
   * @param {Object} variety the variety of lettuce to seed
   */
  const seedTray = (variety) => {
    const germinationCopy = _.cloneDeep(germination);
    const newTray = new GerminationTray(variety, day);
    newTray.plants = newTray.capacity;
    germinationCopy.trays.push(newTray);
    setGermination(germinationCopy);
  };

  /**
   * Clears any existing game loops and starts a new one
   */
  const start = () => {
    clearInterval(intervalId);
    intervalId = setInterval(gameLoop, GAME_SPEED);
    setTimer(true);
  };

  /**
   * Resets the game
   */
  const reset = () => {
    clearInterval(intervalId);
    setDay(INIT.day);
    setGermination(INIT.germination);
    setProduction(INIT.production);
    setHarvest(INIT.harvest);
    setTimer(false);
  };

  return (
    <div className="App">
      {/* Header */}
      <div className="container mt-3 mb-5">
        <div className="row">
          <div className="col-4 text-start">
            <h1>Greenhouse</h1>
          </div>
          <div className="col-4 mt-0">
            <span className="fs-3">Day {day}</span>
            <div className="timer mt-2">
              {timer && <div className="timer-value"></div>}
            </div>
          </div>
          <div className="col-4 text-end">
            <button className="btn btn-success" onClick={start}>
              Start
            </button>
            <button className="btn btn-warning ms-2" onClick={reset}>
              Reset
            </button>
            <button className="btn btn-ghost ms-2" onClick={debug}>
              Debug
            </button>
          </div>
        </div>
      </div>

      {/* Germination */}
      <h2 className="fs-3">Germination</h2>
      <div className="container mb-4">
        <div className="row">
          <div className="col">
            {varieties.map((variety) => (
              <button
                className="btn btn-primary m-1"
                onClick={() => seedTray(variety)}
              >
                {variety.name}
              </button>
            ))}
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div
              className="container my-2 py-1 border border-2 rounded-3"
              style={{ width: "655px", height: "170px" }}
            >
              <div className="row">
                {germination.trays.map((tray, ti) => (
                  <div
                    className="col border border-success m-1 rounded-1 p-1"
                    key={ti}
                    style={{
                      fontSize: "10px",
                      minWidth: "70px",
                      maxWidth: "70px",
                      minHeight: "100px",
                      maxHeight: "100px",
                    }}
                  >
                    {tray.name}
                    <br />
                    {tray.plants} / {tray.capacity}
                    <br />
                    <br />
                    {daysToTransplant(tray) > 0 ? (
                      <div>Transplant in {daysToTransplant(tray)} day(s)</div>
                    ) : (
                      <div>Ready to transplant</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ponds */}
      <h2 className="fs-3">Production</h2>
      <div
        className="border border-2 rounded-3 container py-2 mb-5"
        style={{ minWidth: "932px" }}
      >
        {production.map((pond, pondIndex) => (
          <div className="row mx-2 mb-3 g-0 align-items-center" key={pond.name}>
            <h3 className="fs-5 text-start">{pond.name}</h3>
            <div className="pond-bg"></div>
            <div className="col-1">
              <button
                className="btn btn-dark position-relative"
                style={{ left: "-60px" }}
                onClick={() => transplantToPond(pondIndex)}
                disabled={!germination.trays.length}
              >
                Transplant
              </button>
            </div>
            {pond.rafts
              // .filter((raft) => raft.variety.name != "Empty")
              .map((raft, ri) => (
                <div
                  className={`col-1 ${timer && "moveRight"} ${
                    raft != null && "border raft"
                  }`}
                  style={{
                    height: "120px",
                    maxWidth: "80px",
                    fontSize: "10px",
                  }}
                  key={`${pond.name}-${ri}`}
                >
                  {raft?.plants}
                  <br /> {raft?.variety?.name}
                  <br />
                  <br />
                  {raft?.creationDay + raft?.variety?.actions[1].day - day >
                  0 ? (
                    <div>
                      Harvest in{" "}
                      {raft.creationDay + raft.variety.actions[1].day - day}{" "}
                      day(s)
                    </div>
                  ) : (
                    <button
                      className="btn btn-dark btn-sm"
                      onClick={() =>
                        harvestRaftFromPond(raft, pond, pondIndex, ri)
                      }
                    >
                      Harvest
                    </button>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* Harvesting */}
      <h2 className="fs-3">Harvest Area</h2>
      <div className="container mb-4">
        {harvested[0].name}: {harvested[0].quantity}
        <br />
        {harvested[1].name}: {harvested[1].quantity}
        <br />
        {harvested[2].name}: {harvested[2].quantity}
      </div>
    </div>
  );
}

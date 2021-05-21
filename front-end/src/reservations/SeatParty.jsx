import React, { useState } from "react";
import { useRouteMatch, useHistory } from "react-router-dom";
import { readReservation, updateTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

export default function SeatParty({ setCalledAPI, tables, setTables }) {
  const history = useHistory();
  const [reservation, setReservation] = useState(null);
  const [table, setTable] = useState({});
  const [error, setError] = useState(null);
  const abortController = new AbortController();
  const {
    params: { reservationId },
  } = useRouteMatch();

  async function handleSubmit(event) {
    event.preventDefault();
    await reservationExists();
    if (reservation && validateCapacity()) {
      updateTable(table.table_id, reservationId, abortController.signal)
        .then(() => setCalledAPI(true))
        .then(history.push("/dashboard"))
        .catch(() => setError({ message: "Update failed." }));
    } else {
      setError({
        message:
          "An error occurred. Either the reservation does not exist or the capacity of the table is too small for the party",
      });
    }
  }

  function handleChange({ target }) {
    setTable(() => tables.find((entry) => +entry.table_id === +target.value));
  }

  function reservationExists() {
    return readReservation(reservationId, abortController.signal)
      .then(setReservation)
      .catch(() => setError({ message: "The reservation was not found" }));
  }

  function validateCapacity() {
    return reservation.people <= table.capacity;
  }

  return (
    <>
      <h2>Seat Party {reservationId}</h2>
      <ErrorAlert error={error} />
      <form name="seat-party" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="table_id">Table number:</label>
          <select onChange={handleChange} name="table_id">
            {tables.map((table) => (
              <option value={table.table_id} key={table.table_id}>
                {table.table_name} - {table.capacity}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" type="submit">
          Submit
        </button>
        <button className="btn btn-secondary ml-1" onClick={history.getBack}>
          Cancel
        </button>
      </form>
    </>
  );
}

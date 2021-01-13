import React, { useState, useEffect } from 'react';
import { user } from '../reducers/user';
import { useDispatch, useSelector } from 'react-redux';

const URL = 'http://localhost:8080/users';
export const Profile = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector((store) => store.user.login.accessToken);
  const userId = useSelector((store) => store.user.login.userId);

  const loginSuccess = (loginResponse) => {
    dispatch(
      user.actions.setStatusMessage({
        statusMessage: loginResponse.secretMessage,
      })
    );
  };

  const loginFailed = (loginError) => {
    dispatch(user.actions.setAccessToken({ accessToken: null }));
    dispatch(user.actions.setStatusMessage({ statusMessage: loginError }));
  };

  const logoutSuccess = () => {
    dispatch(
      user.actions.setStatusMessage({
        statusMessage: 'Logout success',
      })
    );
    dispatch(user.actions.setAccessToken({ accessToken: null }));
  };

  const logoutFailed = (logoutError) => {
    dispatch(
      user.actions.setStatusMessage({
        statusMessage: logoutError,
      })
    );
  };

  const logout = () => {
    // Include userId in the path
    fetch(`${URL}/logout`, {
      method: 'POST',
      // Include the accessToken to get the protected endpoint
      headers: { Authorization: accessToken },
    })
      .then((res) => {
        if (!res.ok) {
          throw 'Failed to logout';
        }
        return res.json();
      })
      // SUCCESS: Do something with the information we got back
      .then((json) => logoutSuccess(json))
      .catch((err) => logoutFailed(err));
  };

  const getSecret = () => {
    // Include userId in the path
    fetch(`${URL}/${userId}/secret`, {
      method: 'GET',
      // Include the accessToken to get the protected endpoint
      headers: { Authorization: accessToken },
    })
      .then((res) => {
        if (!res.ok) {
          throw 'Failed to retrieve secret';
        }
        return res.json();
      })
      // SUCCESS: Do something with the information we got back
      .then((json) => loginSuccess(json))
      .catch((err) => loginFailed(err)); //401
  };
  if (!accessToken) {
    return <></>;
  }

  return (
    <section class="profile">
      <h2>Profile:</h2>
      <h4>userId:</h4>
      <p> {`${userId}`}</p>
      <h4>accessToken:</h4>
      <p> {`${accessToken}`}</p>
      <input type="submit" onClick={getSecret} value="Test Secret Endpoint" />
      <input type="submit" onClick={logout} value="Test Logout" />
    </section>
  );
};
export default Profile;

import React, { useState, useEffect } from 'react';
import { user } from '../reducers/user';
import { useDispatch, useSelector } from 'react-redux';

const URL = 'http://localhost:8080/users';
const SECRET_URL = 'http://localhost:8080/secret';
export const Profile = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector((store) => store.user.login.accessToken);
  const userId = useSelector((store) => store.user.login.userId);
  const statusMessage = useSelector((store) => store.user.login.statusMessage);

  const loginSuccess = (loginResponse) => {
    dispatch(
      user.actions.setStatusMessage({
        statusMessage: loginResponse.secretMessage,
      })
    );
  };

  const loginFailed = (loginError) => {
    dispatch(user.actions.setStatusMessage({ statusMessage: loginError }));
  };

  const logout = () => {};

  const testSecret = () => {
    // Include userId in the path
    fetch(`${SECRET_URL}`, {
      method: 'GET',
      // Include the accessToken to get the protected endpoint
      headers: { Authorization: accessToken },
    })
      .then((res) => {
        if (!res.ok) {
          throw 'Profile test failed';
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
      <input type="submit" onClick={testSecret} value="Test Secret" />
      <input type="submit" onClick={logout} value="Test Logout" />
    </section>
  );
};
export default Profile;

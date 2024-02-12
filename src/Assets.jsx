import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import { Container, Row, Col } from "react-grid-system";

const Assets = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [buckets, setBuckets] = useState([]);

  useEffect(() => {
    axios
      .get("/api/assets/users")
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error(error);
      });

    axios
      .get("/api/assets/roles")
      .then((response) => {
        setRoles(response.data);
      })
      .catch((error) => {
        console.error(error);
      });

    axios
      .get("/api/assets/buckets")
      .then((response) => {
        setBuckets(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <Container>
      <Row>
        <Col>
          <h3>Users</h3>
          <ul>
            {users.map((asset) => (
              <li key={asset.name}>
                <Link to={`/graph/` + asset.name}>{asset.name}</Link>
              </li>
            ))}
          </ul>
        </Col>

        <Col>
          <h3>Roles</h3>
          <ul>
            {roles.map((asset) => (
              <li key={asset.name}>
                <Link to={`/graph/` + asset.name}>{asset.name}</Link>
              </li>
            ))}
          </ul>
        </Col>

        <Col>
          <h3>Buckets</h3>
          <ul>
            {buckets.map((asset) => (
              <li key={asset.name}>
                <Link to={`/graph/` + asset.name}>{asset.name}</Link>
              </li>
            ))}
          </ul>
        </Col>
      </Row>
    </Container>
  );
};

export default Assets;

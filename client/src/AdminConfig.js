import { useState, useEffect } from "react";
import axiosInstance from "./axiosInstance";

const AdminConfig = () => {
  const [users, setUsers] = useState([]);
  const [recordInfo, setRecordInfo] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/getUsers");
        if (response.status === "OK") {
          setUsers(response.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchUsers();
  }, []);

  const checkRole = (checked, role) => {
    checked
      ? setRecordInfo((prev) => ({
          ...prev,
          roles: [...prev.roles, role],
        }))
      : setRecordInfo((prev) => {
          return {
            ...prev,
            roles: prev.roles.filter((rl) => rl !== role),
          };
        });
  };

  const handleAddition = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/addUser", recordInfo);
      if (response.status === "OK") {
        setUsers([...users, recordInfo]);
        setRecordInfo(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className="w-50">
        <h4>Manage Users</h4>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Id</th>
              <th scope="col">Email Id</th>
              <th scope="col">Roles</th>
            </tr>
          </thead>
          {users.map((user, index) => {
            return (
              <tr>
                <th scope="row">{index + 1}</th>
                <td>{user.emailId}</td>
                <td>
                  <div className="d-flex gap-2">
                    {user.roles.includes("ADMIN") && (
                      <span className="badge bg-primary">ADMIN</span>
                    )}
                    {user.roles.includes("CREATE") && (
                      <span className="badge bg-secondary">CREATE</span>
                    )}
                    {user.roles.includes("UPDATE") && (
                      <span className="badge bg-info">UPDATE</span>
                    )}
                    {user.roles.includes("DELETE") && (
                      <span className="badge bg-danger">DELETE</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </table>
        <button
          type="button"
          class="btn btn-primary"
          onClick={() =>
            setRecordInfo({
              emailId: "",
              password: "Aqeel@123",
              roles: [],
            })
          }
        >
          + Add
        </button>
      </div>
      {recordInfo && (
        <div className="modal show d-block">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-body">
                <form onSubmit={(e) => handleAddition(e)}>
                  <div>
                    <label for="exampleInputEmail1" className="form-label mt-4">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="exampleInputEmail1"
                      aria-describedby="emailHelp"
                      placeholder="Enter email"
                      required
                      value={recordInfo.emailId}
                      onChange={(e) =>
                        setRecordInfo((prev) => ({
                          ...prev,
                          emailId: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label for="exampleInputEmail1" class="form-label mt-4">
                      Password
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      id="exampleInputEmail1"
                      aria-describedby="emailHelp"
                      placeholder="Password"
                      required
                      value={recordInfo.password}
                      disabled
                    />
                  </div>

                  <label for="exampleInputEmail1" class="form-label mt-4">
                    Roles
                  </label>

                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      value={recordInfo.roles.includes("CREATE")}
                      onChange={(e) => checkRole(e.target.checked, "CREATE")}
                      id="flexCheckDefault"
                    />
                    <label class="form-check-label" for="flexCheckDefault">
                      CREATE
                    </label>
                  </div>

                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      value={recordInfo.roles.includes("UPDATE")}
                      onChange={(e) => checkRole(e.target.checked, "UPDATE")}
                      id="flexCheckDefault"
                    />
                    <label class="form-check-label" for="flexCheckDefault">
                      UPDATE
                    </label>
                  </div>

                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      value={recordInfo.roles.includes("DELETE")}
                      onChange={(e) => checkRole(e.target.checked, "DELETE")}
                      id="flexCheckDefault"
                    />
                    <label class="form-check-label" for="flexCheckDefault">
                      DELETE
                    </label>
                  </div>

                  <div class="d-flex justify-content-end gap-3 mt-3">
                    <button
                      type="button"
                      class="btn btn-secondary"
                      onClick={() => setRecordInfo(null)}
                    >
                      Close
                    </button>
                    <button type="submit" class="btn btn-primary">
                      Add
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminConfig;

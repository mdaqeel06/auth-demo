import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "./axiosInstance";
import { AppContext } from "./appContext";
import AdminConfig from "./AdminConfig";

const Home = () => {
  const { userInfo } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState(1);

  const [students, setStudents] = useState([]);
  const [recordInfo, setRecordInfo] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentRecords = async () => {
      const response = await axiosInstance.get("/getStudents");
      if (response.status === "OK") {
        setStudents(response.data);
      }
    };

    fetchStudentRecords();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post("./logout");
      if (response.status === "OK") {
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddition = async () => {
    try {
      const record = { ...recordInfo };
      delete record.isNew;
      const response = await axiosInstance.post("/addStudent", record);
      if (response.status === "OK") {
        setStudents((prev) => [
          ...prev,
          { _id: response.insertedId, ...record },
        ]);
        setRecordInfo(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdation = async () => {
    try {
      const response = await axiosInstance.patch("/updateStudent", recordInfo);
      if (response.status === "OK") {
        setStudents((prev) => {
          return prev.map((student) => {
            if (student._id === recordInfo._id) {
              return recordInfo;
            } else {
              return student;
            }
          });
        });
        setRecordInfo(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletion = async (id) => {
    try {
      const response = await axiosInstance.delete(`/deleteStudent?id=${id}`);
      if (response.status === "OK") {
        setStudents((prev) => {
          return prev.filter((student) => student._id !== id);
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <nav className="navbar bg-body-tertiary" data-bs-theme="light">
        <div className="container-fluid">
          <a className="navbar-brand"></a>
          <div className="d-flex gap-3 justify-content-center align-items-center ms-auto">
            <svg
              width="35px"
              height="35px"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g color="#000000" fill="gray">
                <path
                  d="M8 2a2.84 2.84 0 0 0-1.12.221c-.345.141-.651.348-.906.615v.003l-.001.002c-.248.269-.44.592-.574.96-.137.367-.203.769-.203 1.2 0 .435.065.841.203 1.209.135.361.327.68.574.95l.001.002c.254.267.558.477.901.624v.003c.346.141.723.21 1.12.21.395 0 .77-.069 1.117-.21v-.002c.343-.147.644-.357.892-.625.255-.268.45-.59.586-.952.138-.368.204-.774.204-1.21h.01c0-.43-.065-.831-.203-1.198a2.771 2.771 0 0 0-.585-.963 2.5 2.5 0 0 0-.897-.618A2.835 2.835 0 0 0 7.999 2zM8.024 10.002c-2.317 0-3.561.213-4.486.91-.462.35-.767.825-.939 1.378-.172.553-.226.975-.228 1.71L8 14.002h5.629c-.001-.736-.052-1.159-.225-1.712-.172-.553-.477-1.027-.94-1.376-.923-.697-2.124-.912-4.44-.912z"
                  overflow="visible"
                />
              </g>
            </svg>
            <div>
              <p className="text-black mb-0">user@example.com</p>
              <a className="text-primary mb-0" href="#" onclick={handleLogout}>
                Logout
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="d-flex gap-5 p-5">
        <div className="list-group w-25">
          <a
            className={`list-group-item list-group-item-action ${
              activeTab === 1 ? "active" : ""
            }`}
            onClick={() => setActiveTab(1)}
          >
            Home
          </a>
          {userInfo.roles.includes("ADMIN") && (
            <a
              className={`list-group-item list-group-item-action ${
                activeTab === 2 ? "active" : ""
              }`}
              onClick={() => setActiveTab(2)}
            >
              Admin Configuration
            </a>
          )}
          <a
            className={`list-group-item list-group-item-action ${
              activeTab === 3 ? "active" : ""
            }`}
            onClick={() => setActiveTab(3)}
          >
            Settings
          </a>
        </div>
        {activeTab === 1 && (
          <div className="w-75">
            <h4 className="mb-3">Students Database</h4>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Id</th>
                  <th scope="col">Name</th>
                  <th scope="col">Course</th>
                  <th scope="col">Status</th>
                  {["UPDATE", "DELETE"].some((role) =>
                    userInfo.roles.includes(role)
                  ) && <th scope="col">Action</th>}
                </tr>
              </thead>
              {students.map((student, index) => {
                return (
                  <tr>
                    <td>
                      <div>{index + 1}</div>
                    </td>
                    <td>{student.name}</td>
                    <td>{student.course}</td>
                    <td>{student.status}</td>
                    <td>
                      <div className="d-flex gap-3">
                        {["ADMIN", "UPDATE"].some((role) =>
                          userInfo.roles.includes(role)
                        ) && (
                          <button
                            type="button"
                            className="btn btn-outline-info"
                            onClick={() => setRecordInfo(student)}
                          >
                            Update
                          </button>
                        )}
                        {["ADMIN", "DELETE"].some((role) =>
                          userInfo.roles.includes(role)
                        ) && (
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => handleDeletion(student._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </table>
            {["ADMIN", "CREATE"].some((role) =>
              userInfo?.roles.includes(role)
            ) && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  setRecordInfo({
                    name: "",
                    course: "",
                    status: "",
                    isNew: true,
                  })
                }
              >
                + Add
              </button>
            )}
          </div>
        )}
        {activeTab === 2 && <AdminConfig />}
        {activeTab === 3 && (
          <div className="w-100">
            <h4 className="mb-3">Settings</h4>

            <div className="w-25">
              <label for="staticEmail" className="col-form-label">
                Email Address
              </label>
              <div>
                <input
                  type="email"
                  readonly=""
                  className="form-control"
                  id="staticEmail"
                  value={userInfo.emailId}
                  disabled
                />
              </div>
            </div>

            <h6 className="mt-3">Change Password</h6>

            <form className="w-25">
              <div>
                <label for="staticEmail" className="col-form-label">
                  Current Password
                </label>
                <div>
                  <input
                    type="password"
                    readonly=""
                    className="form-control"
                    id="staticEmail"
                    value=""
                  />
                </div>
              </div>
              <div>
                <label for="staticEmail" className="col-form-label">
                  New Password
                </label>
                <div>
                  <input
                    type="password"
                    readonly=""
                    className="form-control"
                    id="staticEmail"
                    value=""
                  />
                </div>
              </div>
              <div>
                <label for="staticEmail" className="col-form-label">
                  Re-Enter New Password
                </label>
                <div>
                  <input
                    type="password"
                    readonly=""
                    className="form-control"
                    id="staticEmail"
                    value=""
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary disabled mt-3">
                Change
              </button>
            </form>
          </div>
        )}
      </div>
      {recordInfo && (
        <div className="modal show d-block">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-body">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    recordInfo.isNew ? handleAddition() : handleUpdation();
                  }}
                >
                  <div>
                    <label for="exampleInputEmail1" className="form-label mt-4">
                      Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="exampleInputEmail1"
                      aria-describedby="emailHelp"
                      placeholder="Name"
                      required
                      value={recordInfo.name}
                      onChange={(e) =>
                        setRecordInfo((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label for="exampleInputEmail1" className="form-label mt-4">
                      Course
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="exampleInputEmail1"
                      aria-describedby="emailHelp"
                      placeholder="Course"
                      required
                      value={recordInfo.course}
                      onChange={(e) =>
                        setRecordInfo((prev) => ({
                          ...prev,
                          course: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label for="exampleInputEmail1" className="form-label mt-4">
                      Status
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="exampleInputEmail1"
                      aria-describedby="emailHelp"
                      placeholder="Status"
                      required
                      value={recordInfo.status}
                      onChange={(e) =>
                        setRecordInfo((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="d-flex justify-content-end gap-3 mt-3">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setRecordInfo(null);
                      }}
                    >
                      Close
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {recordInfo.isNew ? "Add" : "Update"}
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

export default Home;

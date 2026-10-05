import {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
} from "../services/authApi";


export const AuthContext =
  createContext(null);


export const AuthProvider = ({
  children,
}) => {

  const [admin, setAdmin] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  const loadAdmin = useCallback(
    async () => {

      const token =
        localStorage.getItem(
          "adminToken"
        );

      const storedAdmin =
        localStorage.getItem(
          "admin"
        );


      if (!token) {

        setAdmin(null);
        setLoading(false);

        return;
      }


      /*
       * Restore immediately from localStorage.
       */

      if (storedAdmin) {

        try {

          setAdmin(
            JSON.parse(
              storedAdmin
            )
          );

        } catch (error) {

          console.error(
            "Invalid stored admin:",
            error
          );

        }
      }


      try {

        const response =
          await getCurrentAdmin();


        if (response?.success) {

          const adminData =
            response?.data;


          if (adminData) {

            setAdmin(
              adminData
            );

            localStorage.setItem(
              "admin",
              JSON.stringify(
                adminData
              )
            );
          }

        }

      } catch (error) {

        console.error(
          "Admin session validation failed:",
          error
        );


        /*
         * Only logout when backend
         * explicitly says 401.
         */

        if (
          error?.response?.status ===
          401
        ) {

          localStorage.removeItem(
            "adminToken"
          );

          localStorage.removeItem(
            "admin"
          );

          setAdmin(null);
        }

      } finally {

        setLoading(false);

      }

    },
    []
  );


  useEffect(() => {

    loadAdmin();

  }, [loadAdmin]);


  const login = async ({
    username,
    password,
  }) => {

    const response =
      await loginAdmin({
        username,
        password,
      });


    if (!response?.success) {

      throw new Error(
        response?.message ||
          "Login failed"
      );
    }


    const token =
      response?.data?.token;


    const adminData =
      response?.data?.admin;


    if (!token) {

      throw new Error(
        "Authentication token was not returned."
      );
    }


    localStorage.setItem(
      "adminToken",
      token
    );


    if (adminData) {

      localStorage.setItem(
        "admin",
        JSON.stringify(
          adminData
        )
      );

      setAdmin(adminData);

    }


    return response;
  };


  const logout = () => {

    logoutAdmin();

    setAdmin(null);

  };


  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        isAuthenticated:
          Boolean(admin),
        login,
        logout,
        refreshAdmin:
          loadAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
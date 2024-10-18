'use client';
import { useEffect, useState } from 'react';
import { db } from '../firebase'; // Adjust to your firebase config path
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export default function ShineCity() {
  const [appointments, setAppointments] = useState([]);
  const [trashedAppointments, setTrashedAppointments] = useState([]);
  const [isViewingTrash, setIsViewingTrash] = useState(false); // State to toggle between appointments and trash

  // Fetch appointments from Firestore
  useEffect(() => {
    const fetchAppointments = async () => {
      const querySnapshot = await getDocs(collection(db, 'appointments'));
      const fetchedAppointments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAppointments(fetchedAppointments.filter((appointment) => !appointment.deleted));
      setTrashedAppointments(fetchedAppointments.filter((appointment) => appointment.deleted));
    };
    fetchAppointments();
  }, []);

  // Delete appointment (move to trash)
  const deleteAppointment = async (id) => {
    await updateDoc(doc(db, 'appointments', id), { deleted: true });
    setAppointments(appointments.filter((appointment) => appointment.id !== id));
    setTrashedAppointments([...trashedAppointments, appointments.find((appointment) => appointment.id === id)]);
  };

  // Restore appointment from trash
  const restoreAppointment = async (id) => {
    await updateDoc(doc(db, 'appointments', id), { deleted: false });
    setTrashedAppointments(trashedAppointments.filter((appointment) => appointment.id !== id));
    setAppointments([...appointments, trashedAppointments.find((appointment) => appointment.id === id)]);
  };

  // Toggle trash bin view
  const toggleTrashView = () => {
    setIsViewingTrash(!isViewingTrash);
  };
  

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <nav className="bg-black text-gray-400 w-28 flex flex-col items-center">
        <div className="h-16 flex items-center justify-center">
        <img src="/carwash3.png" alt="Logo" className="h-20 w-15" />
        </div>
        <ul className="mt-6">
          {/* Trash Bin Icon */}
          <li className="relative">
            <button 
              onClick={() => setIsViewingTrash(false)} // Ensures you're viewing appointments
              className="inline-block w-auto text-center px-6 py-4 text-white transition-all bg-gray-700 dark:bg-white dark:text-gray-800 rounded-md shadow-xl sm:w-auto hover:bg-gray-900 hover:text-white"
              >
             <i className="mx-auto relative">
              <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path fill-rule="evenodd" clip-rule="evenodd" d="M11.9426 1.25H12.0574C14.3658 1.24999 16.1748 1.24998 17.5863 1.43975C19.031 1.63399 20.1711 2.03933 21.0659 2.93414C21.9607 3.82895 22.366 4.96897 22.5603 6.41371C22.75 7.82519 22.75 9.63423 22.75 11.9426V12.0574C22.75 12.3718 22.75 12.6769 22.7495 12.9731C22.7498 12.982 22.75 12.991 22.75 13C22.75 13.0099 22.7498 13.0197 22.7494 13.0296C22.746 14.8816 22.7225 16.3793 22.5603 17.5863C22.366 19.031 21.9607 20.1711 21.0659 21.0659C20.1711 21.9607 19.031 22.366 17.5863 22.5603C16.1748 22.75 14.3658 22.75 12.0574 22.75H11.9426C9.63423 22.75 7.82519 22.75 6.41371 22.5603C4.96897 22.366 3.82895 21.9607 2.93414 21.0659C2.03933 20.1711 1.63399 19.031 1.43975 17.5863C1.27747 16.3793 1.25397 14.8816 1.25057 13.0295C1.25019 13.0197 1.25 13.0099 1.25 13C1.25 12.991 1.25016 12.982 1.25047 12.9731C1.25 12.6769 1.25 12.3718 1.25 12.0574V11.9426C1.24999 9.63423 1.24998 7.82519 1.43975 6.41371C1.63399 4.96897 2.03933 3.82895 2.93414 2.93414C3.82895 2.03933 4.96897 1.63399 6.41371 1.43975C7.82519 1.24998 9.63423 1.24999 11.9426 1.25ZM2.7535 13.75C2.76294 15.2526 2.79778 16.43 2.92637 17.3864C3.09825 18.6648 3.42514 19.4355 3.9948 20.0052C4.56445 20.5749 5.33517 20.9018 6.61358 21.0736C7.91356 21.2484 9.62178 21.25 12 21.25C14.3782 21.25 16.0864 21.2484 17.3864 21.0736C18.6648 20.9018 19.4355 20.5749 20.0052 20.0052C20.5749 19.4355 20.9018 18.6648 21.0736 17.3864C21.2022 16.43 21.2371 15.2526 21.2465 13.75H18.8397C17.8659 13.75 17.6113 13.766 17.3975 13.8644C17.1838 13.9627 17.0059 14.1456 16.3722 14.8849L15.7667 15.5913C15.7372 15.6257 15.7082 15.6597 15.6794 15.6933C15.1773 16.2803 14.7796 16.7453 14.2292 16.9984C13.6789 17.2515 13.067 17.2509 12.2945 17.2501C12.2503 17.25 12.2056 17.25 12.1603 17.25H11.8397C11.7944 17.25 11.7497 17.25 11.7055 17.2501C10.933 17.2509 10.3211 17.2515 9.77076 16.9984C9.22039 16.7453 8.82271 16.2803 8.32059 15.6933C8.29184 15.6597 8.26275 15.6257 8.23327 15.5913L7.62784 14.8849C6.9941 14.1456 6.81622 13.9627 6.60245 13.8644C6.38869 13.766 6.13407 13.75 5.16026 13.75H2.7535ZM21.25 12.25H18.8397C18.7944 12.25 18.7497 12.25 18.7055 12.2499C17.933 12.2491 17.3211 12.2485 16.7708 12.5016C16.2204 12.7547 15.8227 13.2197 15.3206 13.8067C15.2918 13.8403 15.2628 13.8743 15.2333 13.9087L14.6278 14.6151C13.9941 15.3544 13.8162 15.5373 13.6025 15.6356C13.3887 15.734 13.1341 15.75 12.1603 15.75H11.8397C10.8659 15.75 10.6113 15.734 10.3975 15.6356C10.1838 15.5373 10.0059 15.3544 9.37216 14.6151L8.76673 13.9087C8.73725 13.8743 8.70816 13.8403 8.67941 13.8067C8.17729 13.2197 7.77961 12.7547 7.22924 12.5016C6.67886 12.2485 6.06705 12.2491 5.29454 12.2499C5.25031 12.25 5.20556 12.25 5.16026 12.25H2.75001C2.75 12.1675 2.75 12.0842 2.75 12C2.75 9.62178 2.75159 7.91356 2.92637 6.61358C3.09825 5.33517 3.42514 4.56445 3.9948 3.9948C4.56445 3.42514 5.33517 3.09825 6.61358 2.92637C7.91356 2.75159 9.62178 2.75 12 2.75C14.3782 2.75 16.0864 2.75159 17.3864 2.92637C18.6648 3.09825 19.4355 3.42514 20.0052 3.9948C20.5749 4.56445 20.9018 5.33517 21.0736 6.61358C21.2484 7.91356 21.25 9.62178 21.25 12C21.25 12.0842 21.25 12.1675 21.25 12.25ZM7.25 7C7.25 6.58579 7.58579 6.25 8 6.25H16C16.4142 6.25 16.75 6.58579 16.75 7C16.75 7.41421 16.4142 7.75 16 7.75H8C7.58579 7.75 7.25 7.41421 7.25 7ZM9.25 10.5C9.25 10.0858 9.58579 9.75 10 9.75H14C14.4142 9.75 14.75 10.0858 14.75 10.5C14.75 10.9142 14.4142 11.25 14 11.25H10C9.58579 11.25 9.25 10.9142 9.25 10.5Z" fill="#1C274C"/>
              </svg>

                {/* Badge for number of appointments */}
                <span className="absolute top-0 right-0 -mt-2 block h-6 w-6 text-xs font-bold text-white bg-red-600 rounded-full">
                  {appointments.length}
                </span>
              </i>
          </button>
          </li>

          <li className="relative mt-4">
  {/* Trash Icon with Badge */}
            <button 
              onClick={() => setIsViewingTrash(true)} 
              className="inline-block w-auto text-center px-6 py-4 text-white transition-all bg-gray-700 dark:bg-white dark:text-gray-800 rounded-md shadow-xl sm:w-auto hover:bg-gray-900 hover:text-white"
            >
              <i className="mx-auto relative">
                <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.5001 6H3.5" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M9.5 11L10 16" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M14.5 11L14 16" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6" stroke="#1C274C" stroke-width="1.5"/>
                  <path d="M18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5M18.8334 8.5L18.6334 11.5" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                {/* Badge showing the number of trashed appointments */}
                <span className="absolute top-0 right-0 -mt-2 -mr-2 block h-6 w-6 text-xs font-bold text-white bg-red-600 rounded-full">
                  {trashedAppointments.length}
                </span>
              </i>
            </button>
          </li>

          

          
        </ul>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-100">
        {/* Top bar */}
        <nav className="bg-black border-b p-4 flex justify-between">
          <h1 className="text-xl font-semibold">ShineCity Appointment Panel</h1>
          <button className="inline-block w-auto text-center min-w-[200px] px-6 py-4 text-white transition-all bg-gray-700 dark:bg-white dark:text-gray-800 rounded-md shadow-xl sm:w-auto hover:bg-gray-900 hover:text-white">
            Add Appointment
          </button>
        </nav>

        {/* Conditional View: Appointments or Trash Bin */}
        <main className="flex-1 overflow-auto p-6">
          {isViewingTrash ? (
            <>
              <h2 className="text-2xl text-black text-center font-bold mb-4">Trash Bin</h2>
              <div className="bg-white shadow rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date of Appointment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time of Appointment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {trashedAppointments.length > 0 ? (
                      trashedAppointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.time}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.message}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <button
                              className="text-green-500 hover:text-green-700"
                              onClick={() => restoreAppointment(appointment.id)}
                            >
                              Restore
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center p-4 text-gray-500">
                          No appointments in the trash.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl text-black text-center font-bold mb-4">Appointments</h2>
              <div className="bg-white shadow rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date of Appointment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time of Appointment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.length > 0 ? (
                      appointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.time}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.message}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <button
                              className="text-red-500 hover:text-red-700"
                              onClick={() => deleteAppointment(appointment.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center p-4 text-gray-500">
                          No appointments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

'use client';  // Ensure this is at the top

import { useEffect, useState } from 'react';
import { db } from '../firebase'; // If firebase.js is in the same directory
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export default function ShineCity() {
  const [appointments, setAppointments] = useState([]);
  const [trashedAppointments, setTrashedAppointments] = useState([]);
  const [isViewingTrash, setIsViewingTrash] = useState(false); // State to toggle between appointments and trash
  const [isFormVisible, setIsFormVisible] = useState(false);

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

  // Function to display a message with a dropdown
  const MessagePreview = ({ message }) => {
    const [isExpanded, setIsExpanded] = useState(false);
  
    const toggleMessage = () => {
      setIsExpanded(!isExpanded);
    };
  
  
    const previewMessage = message.length > 20 ? message.slice(0, 20) + '...' : message;
  
    return (
      <div>
        {!isExpanded ? (
          // Preview mode (showing truncated message)
          <div className="block">
            <span className="block whitespace-normal">
              {message.length > 20 ? message.slice(0, 20) + '...' : message}
            </span>
            {message.length > 20 && (
              <button
                className="text-blue-500 hover:text-blue-700 mt-2 block"
                onClick={toggleMessage}
              >
                Show More
              </button>
            )}
          </div>
        ) : (
          // Expanded mode (showing full message)
          <div className="block mt-4 p-4 bg-gray-100 border border-gray-300 rounded-md">
            <span className="block whitespace-normal">
              {message}
            </span>
            <button
              className="text-blue-500 hover:text-blue-700 mt-2 block"
              onClick={toggleMessage}
            >
              Show Less
            </button>
          </div>
        )}
      </div>
    );
  };

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');

  // Scroll to form section when the component mounts
  useEffect(() => {
    const formSection = document.getElementById('appointment-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Function to generate time slots at 30-minute intervals
  const generateTimeSlots = (startHour, startMinute, endHour, endMinute) => {
    const times = [];
    let currentTime = new Date();
    currentTime.setHours(startHour, startMinute, 0, 0); // Set start time

    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0); // Set end time

    while (currentTime <= endTime) {
      const hours = currentTime.getHours();
      const minutes = currentTime.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
      times.push(formattedTime);
      currentTime.setMinutes(currentTime.getMinutes() + 30); // Increment by 30 minutes
    }

    return times;
  };

  const timeSlots = generateTimeSlots(8, 30, 20, 30); // Example from 8:30 AM to 8:30 PM

  // Generate next 7 days for date selection
  const getNext7Days = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      const month = String(nextDate.getMonth() + 1).padStart(2, '0'); // Add leading zero
      const day = String(nextDate.getDate()).padStart(2, '0'); // Add leading zero
      const year = nextDate.getFullYear();
      const formattedDate = `${month}/${day}/${year}`;
      dates.push(formattedDate);
    }
    return dates;
  };

  const availableDates = getNext7Days();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Add form data to Firestore
      await addDoc(collection(firestore, 'appointments'), {
        name,
        phone, // Saving phone instead of email
        date,
        time,
        message,
        createdAt: new Date(),
      });

      alert('Appointment booked successfully! We will contact you soon!');
    } catch (e) {
      console.error('Error adding document: ', e);
    }

    // Clear form fields
    setName('');
    setPhone('');
    setDate('');
    setTime('');
    setMessage('');
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <nav className="bg-gray-600 text-gray-400 w-28 flex flex-col items-center">
        <div className="h-16 flex items-center justify-center">
          <img src="/Shinelogo.png" alt="Logo" className="h-30 w-15 mt-4 py-2" />
        </div>
        <ul className="mt-16">
          {/* Trash Bin Icon */}
          <li className="relative">

            
          <button
            onClick={() => setIsViewingTrash(false)} // Ensures you're viewing appointments
            className="inline-block w-auto text-center ml-2 px-6 py-4 text-white transition-all bg-gray-700 dark:bg-white dark:text-gray-800 rounded-md shadow-xl sm:w-auto hover:bg-sky-500 hover:text-white"
            >
            <i className="mx-auto relative">
              <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 13H5.16026C6.06543 13 6.51802 13 6.91584 13.183C7.31367 13.3659 7.60821 13.7096 8.19729 14.3968L8.80271 15.1032C9.39179 15.7904 9.68633 16.1341 10.0842 16.317C10.482 16.5 10.9346 16.5 11.8397 16.5H12.1603C13.0654 16.5 13.518 16.5 13.9158 16.317C14.3137 16.1341 14.6082 15.7904 15.1973 15.1032L15.8027 14.3968C16.3918 13.7096 16.6863 13.3659 17.0842 13.183C17.482 13 17.9346 13 18.8397 13H22" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C21.5093 4.43821 21.8356 5.80655 21.9449 8" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="absolute top-0 right-0 -mt-2 -mr-2 block h-5 w-6 text-xs font-bold text-white bg-red-600 rounded-full">
                {appointments.length}
              </span>
             </i>
           </button>
          </li>

          <li className="relative mt-4">
            {/* Trash Icon with Badge */}
            <button
              onClick={() => setIsViewingTrash(true)}
              className="inline-block w-auto ml-2 text-center px-6 py-4 text-white transition-all bg-gray-700 dark:bg-white dark:text-gray-800 rounded-md shadow-xl sm:w-auto hover:bg-sky-500 hover:text-white"
            >
              <i className="mx-auto relative">
              
                <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.5001 6H3.5" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M9.5 11L10 16" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M14.5 11L14 16" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6" stroke="#1C274C" strokeWidth="1.5"/>
                  <path d="M18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5M18.8334 8.5L18.6334 11.5" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="absolute top-0 right-0 -mt-2 -mr-2 block h-5 w-6 text-xs font-bold text-white bg-red-600 rounded-full">
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
  <nav className="bg-gray-300 border-b p-4 flex justify-between">
    <h1 className="text-4xl font-semibold">ShineCity Appointment Panel</h1>
    <button
        onClick={() => setIsFormVisible(!isFormVisible)}
        className="inline-block w-auto ml-2 text-center px-6 py-4 mt-4 text-white transition-all bg-gray-700 dark:bg-white dark:text-gray-800 rounded-md shadow-xl sm:w-auto hover:bg-sky-500 hover:text-white"
            >
              <i className="mx-auto relative">
                <h1>New Appointment</h1>
              </i>
            </button>
  </nav>

  {/* Conditional View: Appointments or Trash Bin */}
  <main className="flex-1 overflow-auto p-6">
  {isViewingTrash ? (
    <>
      <h2 className="text-2xl text-black text-center font-bold mb-4">
        Trash Bin
      </h2>
      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date of Appointment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Time of Appointment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trashedAppointments.length > 0 ? (
              trashedAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <MessagePreview message={appointment.message} />
                  </td>
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
      <h2 className="text-2xl text-black text-center font-bold mb-4">
        Appointments
      </h2>
      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date of Appointment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Time of Appointment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <MessagePreview message={appointment.message} />
                  </td>
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

      {/* Form for booking new appointments */}
      <form onSubmit={handleSubmit} id="appointment-form" className="p-8">
        <div className="flex gap-4">
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-1/2 rounded-md border border-slate-300 bg-white px-3 py-4 placeholder-slate-400 shadow-sm placeholder:font-semibold placeholder:text-gray-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 sm:text-sm"
            placeholder="Full Name *"
            required
            autoComplete="name"
          />
          <input
            type="tel"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-1/2 rounded-md border border-slate-300 bg-white px-3 py-4 placeholder-slate-400 shadow-sm placeholder:font-semibold placeholder:text-gray-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 sm:text-sm"
            placeholder="Phone Number *"
            required
            autoComplete="tel"
          />
        </div>

        <div className="my-6 flex gap-4">
          <select
            name="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="block w-1/2 rounded-md border border-slate-300 bg-white px-3 py-4 font-semibold text-gray-500 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 sm:text-sm"
            required
            autoComplete="off"
          >
            <option className="font-semibold text-slate-300" value="">
              Select Date
            </option>
            {availableDates.map((availableDate, index) => (
              <option key={index} value={availableDate}>
                {availableDate}
              </option>
            ))}
          </select>

          <select
            name="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="block w-1/2 rounded-md border border-slate-300 bg-white px-3 py-4 font-semibold text-gray-500 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 sm:text-sm"
            required
            autoComplete="off"
          >
            <option className="font-semibold text-slate-300" value="">
              Select Time
            </option>
            {timeSlots.map((slot, index) => (
              <option key={index} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>

        <div>
          <textarea
            name="message"
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            cols="30"
            rows="10"
            className="mb-10 h-40 w-full resize-none rounded-md border border-slate-300 p-5 font-semibold text-gray-300"
            placeholder="Message"
            autoComplete="off"
          ></textarea>
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="cursor-pointer rounded-lg bg-blue-700 px-8 py-5 text-sm font-semibold text-white"
          >
            Book Appointment
          </button>
        </div>
      </form>
    </>
  )}
</main>;
</div>

    </div>
  );
}

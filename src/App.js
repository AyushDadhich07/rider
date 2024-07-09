import React, { useState, useEffect } from 'react';

const styles = {
  container: {
    minHeight: '100vh',
    background: '#121212',
    color: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
  },
  header: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '2rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  section: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '12px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    outline: 'none',
  },
  button: {
    padding: '12px',
    borderRadius: '5px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'opacity 0.3s',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
  },
  listItem: {
    marginBottom: '10px',
    padding: '15px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    color: '#ffffff',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 999,
  },
};


const RideShareHomepage = () => {
  const [recentRequests, setRecentRequests] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [destination, setDestination] = useState('airport');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [searchDestination, setSearchDestination] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);

  useEffect(() => {
    fetchRecentRequests();
  }, []);

  const fetchRecentRequests = async () => {
    try {
      const response = await fetch('https://gleeful-eclair-773821.netlify.app/api/ride-requests');
      const data = await response.json();
      setRecentRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching recent requests:', error);
      setRecentRequests([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://gleeful-eclair-773821.netlify.app/api/ride-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone, destination, date, notes }),
      });
      if (response.ok) {
        alert('Ride request submitted successfully!');
        setName('');
        setPhone('');
        setDestination('airport');
        setDate('');
        setNotes('');
        fetchRecentRequests(); // Refresh the recent requests list
      } else {
        const errorData = await response.json();
        alert(`Failed to submit ride request: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting ride request:', error);
      alert(`An error occurred: ${error.message}`);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const queryParams = new URLSearchParams({
        destination: searchDestination,
        date: searchDate,
      }).toString();
      const response = await fetch(`https://gleeful-eclair-773821.netlify.app/api/ride-requests/search?${queryParams}`);
      const data = await response.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error searching ride requests:', error);
      alert(`An error occurred while searching: ${error.message}`);
    }
  };

  const fetchRideDetails = async (id) => {
    try {
      const response = await fetch(`https://gleeful-eclair-773821.netlify.app/api/ride-requests/${id}`);
      const data = await response.json();
      setSelectedRide(data);
    } catch (error) {
      console.error('Error fetching ride details:', error);
      alert(`An error occurred while fetching ride details: ${error.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>IIT Guwahati Ride Share</h1>
      
      <div style={styles.section}>
        <h2>Submit a Ride Request</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input style={styles.input} type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <select style={styles.input} value={destination} onChange={(e) => setDestination(e.target.value)} required>
            <option value="airport">Airport</option>
            <option value="railway station">Railway Station</option>
          </select>
          <input style={styles.input} type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
          <textarea style={styles.input} placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
          <button style={styles.button} type="submit">Submit Request</button>
        </form>
      </div>

      <div style={styles.section}>
        <h2>Search Ride Requests</h2>
        <form onSubmit={handleSearch} style={styles.form}>
          <select style={styles.input} value={searchDestination} onChange={(e) => setSearchDestination(e.target.value)}>
            <option value="">Select Destination</option>
            <option value="airport">Airport</option>
            <option value="railway station">Railway Station</option>
          </select>
          <input style={styles.input} type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} />
          <button style={styles.button} type="submit">Search Rides</button>
        </form>
        <div>
          <h3>Search Results</h3>
          {searchResults.length > 0 ? (
            <ul style={styles.list}>
              {searchResults.map(request => (
                <li key={request.id} style={styles.listItem} onClick={() => fetchRideDetails(request.id)}>
                  {request.name} - {request.destination} - {new Date(request.date).toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <p>No matching ride requests found.</p>
          )}
        </div>
      </div>

      <div style={styles.section}>
        <h2>Recent Ride Requests</h2>
        <ul style={styles.list}>
          {recentRequests.map(request => (
            <li key={request.id} style={styles.listItem} onClick={() => fetchRideDetails(request.id)}>
              {request.name} - {request.destination} - {new Date(request.date).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>

      {selectedRide && (
        <div style={styles.modalOverlay} onClick={() => setSelectedRide(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{selectedRide.name}'s Ride Details</h2>
            <p><strong>Destination:</strong> {selectedRide.destination}</p>
            <p><strong>Date:</strong> {new Date(selectedRide.date).toLocaleString()}</p>
            <p><strong>Phone:</strong> {selectedRide.phone}</p>
            <p><strong>Notes:</strong> {selectedRide.notes || 'No additional notes'}</p>
            <button style={styles.button} onClick={() => setSelectedRide(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideShareHomepage;

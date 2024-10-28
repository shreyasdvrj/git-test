import * as React from "react";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import Footer from "./Footer";
import { CardActionArea } from "@mui/material";

const SearchBar = ({ setSearchQuery }) => (
  <form>
    <TextField
      id="search-bar"
      className="text"
      onInput={(e) => {
        setSearchQuery(e.target.value);
      }}
      label="Enter an event"
      variant="outlined"
      placeholder="Search..."
      size="small"
    />
  </form>
);

const filterData = (query, cards) => {
  if (!query) {
    return cards;
  } else {
    return cards.filter((e) =>
      e.title.toLowerCase().includes(query.toLowerCase())
    );
  }
};

const defaultTheme = createTheme();

export default function Events(props) {
  const [events, setEvents] = useState([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState({});
  // Create state for modal visibility
  const [eventModals, setEventModals] = useState({});
  // Function to open and close the modal
  const handleOpenModal = (eventTitle) => {

    axios
      .post(
        "/is-enrolled",
        {
          eventTitle: eventTitle,
        },
        {
          headers: {
            Authorization: "Bearer " + props.state.token,
          },
        }
      )
      .then((response) => {
        if (response.data.isEnrolled) {
          setEnrollmentStatus((prevStatus) => ({
            ...prevStatus,
            [eventTitle]: true,
          }));
        } else {
          setEnrollmentStatus((prevStatus) => ({
            ...prevStatus,
            [eventTitle]: false,
          }));
        }
        setEventModals({ ...eventModals, [eventTitle]: true });
      })
      .catch((error) => {
        console.error(
          "An error occurred while checking enrollment status: ",
          error
        );
      });
  };

  const handleCloseModal = (eventTitle) => {
    setEventModals({ ...eventModals, [eventTitle]: false });
  };

  const [searchQuery, setSearchQuery] = useState("");
  const eventsFiltered = filterData(searchQuery, events);
  const location = useLocation();

  useEffect(() => {
    fetch("/events")
      .then((response) => response.json())
      .then((data) => setEvents(data))
      .catch((error) => console.error("Error fetching events:", error));
      const eventToOpen = location.state?.openModalForEvent;
  if (eventToOpen) {
    handleOpenModal(eventToOpen);
  }
  // eslint-disable-next-line
  }, [location.state]);

  const handleEnrollUnenroll = (eventTitle) => {
    const userEmail = "user@example.com"; // Get user email here

    axios
      .post(
        "/is-enrolled",
        {
          eventTitle: eventTitle,
        },
        {
          headers: {
            Authorization: "Bearer " + props.state.token,
          },
        }
      )
      .then((response) => {
        if (response.data.isEnrolled) {
          axios
      .post(
        "/unenroll",
        {
          email: userEmail,
          eventTitle: eventTitle,
        },
        {
          headers: {
            Authorization: "Bearer " + props.state.token,
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        if (response.data.status === "Data saved successfully") {
          setEnrollmentStatus((prevStatus) => ({
            ...prevStatus,
            [eventTitle]: false,
          }));
        }
      })
      .catch((error) => {
        console.error("An error occurred while sending the data: ", error);
        setEnrollmentStatus((prevStatus) => ({
          ...prevStatus,
          [eventTitle]: true,
        }));
      });
        } else {
          axios
      .post(
        "/enroll",
        {
          email: userEmail,
          eventTitle: eventTitle,
        },
        {
          headers: {
            Authorization: "Bearer " + props.state.token,
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        if (response.data.status === "Data saved successfully") {
          setEnrollmentStatus((prevStatus) => ({
            ...prevStatus,
            [eventTitle]: true,
          }));
        }
      })
      .catch((error) => {
        console.error("An error occurred while sending the data: ", error);
        setEnrollmentStatus((prevStatus) => ({
          ...prevStatus,
          [eventTitle]: false,
        }));
      });
    }})
  };

    return (
        <ThemeProvider theme={defaultTheme}>
            <CssBaseline />
            <main>
                <Box
                    sx={{
                        bgcolor: 'background.paper',
                        pt: 8,
                        pb: 6,
                    }}
                >
                    <Container maxWidth="sm">
                        <Typography
                            component="h1"
                            variant="h2"
                            align="center"
                            color="text.primary"
                            gutterBottom
                        >
                            Events
                        </Typography>
                        <Typography variant="h5" align="center" color="text.secondary" paragraph>
                            Start your wellness journey with us today! Discover yoga, swimming, gym, and more. Click "More Information" for event details, and enroll into events that motivate you.
                        </Typography>
                        <Stack
                            sx={{ pt: 4 }}
                            direction="row"
                            spacing={2}
                            justifyContent="center"
                        >
                            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                        </Stack>
                    </Container>
                </Box>

                <Container sx={{ py: 8 }} maxWidth="md">
                    <Grid container spacing={4}>
                        {eventsFiltered.map((event) => (
                            <Grid item key={event} xs={12} sm={6} md={4}>
                                <Card
                                    sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                                >
                                  <CardActionArea onClick={() => handleOpenModal(event.title)}>
                                    <CardMedia
                                        component="div"
                                        sx={{
                                            pt: '56.25%',
                                        }}
                                        image={event.imageUrl}
                                    />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography gutterBottom variant="h5" component="h2">
                                            {event.title}
                                        </Typography>
                                        <Typography>
                                            {event.description}
                                        </Typography>
                                    </CardContent>
                                    </CardActionArea>
                                </Card>
                                <Modal open={eventModals[event.title]} onClose={() => handleCloseModal(event.title)}>
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: '50%',
                                            bgcolor: 'background.paper',
                                            border: '2px solid #000',
                                            boxShadow: 24,
                                            p: 4,
                                        }}
                                    >
                                        <Typography variant="h6" component="div">
                                            <strong>{event.title}</strong>
                                        </Typography>
                                        <Typography sx={{ mt: 2 }}> {event.eventInfo} </Typography>
                                        <Typography sx={{ mt: 2 }}><strong>Location:</strong> {event.eventLocation}</Typography>
                                        <Typography sx={{ mt: 2 }}><strong>Date:</strong> {event.eventDate}</Typography>
                                        <Typography sx={{ mt: 2 }}><strong>Time:</strong> {event.eventTime}</Typography>
                                        <Button onClick={() => handleEnrollUnenroll(event.title)}>{enrollmentStatus[event.title] ? "Unenroll" : "Enroll"}</Button>
                                        <Button onClick={() => handleCloseModal(event.title)}>Close</Button>
                                        {enrollmentStatus[event.title] && (
                                            <Typography variant="body2" color="green" component="p">
                                                You have successfully enrolled for the event!
                                            </Typography>
                                        )}
                                    </Box>
                                </Modal>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
                <Footer/>
            </main>
        </ThemeProvider>
    );
}

import React from "react";
import { Container, Typography, Paper } from "@mui/material";

function About() {
  const paperStyle = {
    marginTop: "2rem",
    padding: "2rem",
    textAlign: "left",
    borderRadius: "1rem",
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} style={paperStyle}>
        <Typography
          variant="h4"
          style={{
            fontSize: "28px",
            fontWeight: 600,
            color: "transparent",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundImage:
              "linear-gradient(145deg, #6db3f2, #1e5799)",
            display: "inline",
          }}
          gutterBottom
        >
          About
        </Typography>
        <Typography variant="h6" style={{ marginTop: "2rem" }} gutterBottom>
          What is Gruuper?
        </Typography>
        <Typography variant="body1" paragraph>
          Attention all teachers and professors: Gone are the times of countless
          hours spent trying to group your students for projects. No more
          worrying about frustrating slackers and do-it-all over-achievers. With
          Gruuper, we make the class group-making process fun and easy, with
          curated student profiles aimed to make each group a perfect match. So
          what are you waiting for? Log on to Gruuper today and watch the
          benefits roll in!
        </Typography>
        <Typography variant="h6" gutterBottom>
          How do I use Gruuper?
        </Typography>
        <Typography variant="body1" paragraph>
          Once you register as a professor and create a classroom, giving the
          classroom code to your students is the first step. After that, you can
          easily facilitate group work and collaboration within the classroom.
          To create random groups, access your classroom settings and use the
          platform's built-in random group generator, specifying the desired
          group size. Simply adjust the settings to increase or decrease the
          number of students in each group, and the platform will automatically
          reorganize them accordingly. If you need to swap people around in
          groups, simply use the drag-and-drop functionality. These features
          provide an efficient way to organize and manage group activities
          within your virtual classroom. Gruuping has never been this easy!
        </Typography>
      </Paper>
    </Container >
  );
}

export default About;

import React from "react";

function About() {
  return (
    <div>
      <h1>About</h1>
      <h3 style={{ textAlign: "left", marginLeft: "4rem" }}>
        What is Gruuper?
      </h3>
      <p style={{ textAlign: "left", marginLeft: "4rem", marginRight: "4rem" }}>
        {" "}
        Attention all teachers and professors: Gone are the times of countless
        hours spent trying to group your students for projects. No more worrying
        about frustrating slackers and do-it-all over-achievers. With Gruuper,
        we make the class group-making process fun and easy, with curated
        student profiles aimed to make each group a perfect match. So what are
        you waiting for? Log on to Gruuper today and watch the benefits roll in!{" "}
      </p>
      <h3 style={{ textAlign: "left", marginLeft: "4rem" }}>
        How do I use Gruuper?
      </h3>
      <p style={{ textAlign: "left", marginLeft: "4rem", marginRight: "4rem" }}>
        Once you register as a professor and create a classroom, giving the
        classroom code to your students is the first step. After that, you can
        easily facilitate group work and collaboration within the classroom. To
        create random groups, access your classroom settings and use the
        platform's built-in random group generator, specifying the desired group
        size. Simply adjust the settings to increase or decrease the number of
        students in each group, and the platform will automatically reorganize
        them accordingly. If you need to swap people around in groups, simply
        use the drag-and-drop functionality. These features provide an efficient
        way to organize and manage group activities within your virtual
        classroom. Gruuping has never been this easy!
      </p>
    </div>
  );
}

export default About;

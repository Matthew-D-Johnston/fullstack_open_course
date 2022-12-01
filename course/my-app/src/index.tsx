import React from 'react';
import ReactDOM from 'react-dom';

interface WelcomeProps {
  name: string;
}

const Welcome = (props: WelcomeProps) => {
  return <h1>Hello, {props.name}</h1>;
};

const courseParts = [
  {
    name: "Fundamentals",
    exerciseCount: 10,
    description: "This is an awesome course part"
  },
  {
    name: "Using props to pass data",
    exerciseCount: 7,
    groupProjectCount: 3
  },
  {
    name: "Deeper type usage",
    exerciseCount: 14,
    description: "Confusing description",
    exerciseSubmissionLink: "https://fake-exercise-submit.made-up-url.dev"
  }
];

interface CoursePartOne {
  name: "Fundamentals";
  exerciseCount: number;
  description: string;
}

interface CoursePartTwo {
  name: "Using props to pass data";
  exerciseCount: number;
  groupProjectCount: number;
}

interface CoursePartThree {
  name: "Deeper type usage";
  exerciseCount: number;
  description: string;
  exerciseSubmissionLink: string;
}

type CoursePart = CoursePartOne | CoursePartTwo | CoursePartThree;

const element = <Welcome name="Sarah" />;
ReactDOM.render(element, document.getElementById("root"));

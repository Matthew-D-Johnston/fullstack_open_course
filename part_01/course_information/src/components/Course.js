const Header = (props) => {
  return (
    <h2>{props.course}</h2>
  );
};

const Part = (props) => {
  return (
    <p>{props.part} {props.exercises}</p>
  );  
};

const Content = (props) => {
  return (
    <div>
      {props.parts.map(part => {
        return <Part key={part.id} part={part.name} exercises={part.exercises} />;
      })}
    </div>
  );
};

const Total = (props) => {
  return (
    <p>total of {props.parts.reduce((totalExercises, part) => totalExercises + part.exercises, 0)} exercises</p>
  );
};

const Course = ({ course }) => {
  return (
    <div>
      <Header course={course.name} />
      <Content parts={course.parts} />
      <Total parts={course.parts} />
    </div>
  );
};

export default Course;

import { useSelector } from "react-redux";

const CallHistory = () => {
  const { callHistory } = useSelector((state) => state.call);

  return (
    <div>
      <h3>Recent Calls</h3>
      {callHistory.map((call) => (
        <div key={call.id}>
          <span>{call.user?.name || "Unknown"}</span>
          <span>{call.type}</span>
          <span>{call.duration}</span>
        </div>
      ))}
    </div>
  );
};

export default CallHistory
import { Topic } from "@/types"

type LegendItemProps = {
  topic: Topic;
}

type TopicLegendProps = {
  topics: Topic[];
} 

export const LegendItem: React.FC<LegendItemProps> = ({ topic }) => {
  return (
    <p
      className="text-white text-center text-[0.8rem] rounded-md px-2 py-1"
      style={{
        backgroundColor: `rgb(${topic.color.r}, ${topic.color.g}, ${topic.color.b})`,
      }}
    >
      {topic.title}
    </p>
  );
}

export const TopicLegend: React.FC<TopicLegendProps> = ({ topics }) => {
  return (
    <div className="flex flex-row flex-wrap justify-center items-center gap-1 mt-2">
      {topics.map((topic) => {
        return (
          <LegendItem
            key={topic.id}
            topic={topic}
          />
        )
      })}
    </div>
  );
}

export default TopicLegend;
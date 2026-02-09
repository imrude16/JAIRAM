import React from "react";
import { Megaphone, Calendar, Award } from "lucide-react";
import Card from "../../common/Card/Card";
import Badge from "../../common/Badge/Badge";
import Button from "../../common/Button/Button";

const Announcements = () => {
  const announcements = [
    {
      id: 1,
      icon: Megaphone,
      title: "Call for Papers: Special Issue 2026",
      description:
        "Submissions are now open for our special issue on Precision Medicine and Personalized Healthcare.",
      date: "Deadline: January 31, 2026",
      badge: "Important",
      badgeColor: "red",
    },
    {
      id: 2,
      icon: Award,
      title: "Best Paper Award 2026",
      description:
        "Congratulations to Dr. Smith et al. for winning the Best Paper Award for their groundbreaking research.",
      date: "Januray 15, 2026",
      badge: "Award",
      badgeColor: "yellow",
    },
  ];

  return (
    <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Latest Announcements
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {announcements.map((announcement) => (
          <Card key={announcement.id} hover className="flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <announcement.icon className="w-6 h-6 text-blue-600" />
              </div>
              <Badge
                text={announcement.badge}
                variant={announcement.badgeColor}
              />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {announcement.title}
            </h3>

            <p className="text-gray-600 text-sm mb-4 grow">
              {announcement.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-xs text-gray-500">{announcement.date}</span>
              <Button variant="ghost" size="sm">
                Read More
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Announcements;

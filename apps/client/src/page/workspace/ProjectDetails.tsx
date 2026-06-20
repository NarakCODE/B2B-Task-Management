import { Separator } from "@/components/ui/separator";
import ProjectAnalytics from "@/components/workspace/project/project-analytics";
import ProjectHeader from "@/components/workspace/project/project-header";
import TaskTable from "@/components/workspace/task/task-table";
import SprintManager from "@/components/workspace/project/sprint-manager";
import ProjectTimeline from "@/components/workspace/project/project-timeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageContainer from "@/components/resuable/page-container";

const ProjectDetails = () => {
  return (
    <PageContainer className="space-y-6 py-4 md:pt-3">
      <ProjectHeader />
      <Separator />

      <Tabs defaultValue="tasks" className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-4 max-w-[500px]">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="sprints">Sprints</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <TaskTable />
        </TabsContent>

        <TabsContent value="sprints" className="space-y-4">
          <SprintManager />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <ProjectTimeline />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <ProjectAnalytics />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default ProjectDetails;

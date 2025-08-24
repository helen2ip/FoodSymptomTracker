import { useState } from "react";
import { Settings as SettingsIcon, Download, Trash2, Bell, Shield, HelpCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const { toast } = useToast();

  const handleExportData = () => {
    // In a real app, this would trigger data export
    toast({
      title: "Data Export Started",
      description: "Your food and symptom data is being prepared for download",
    });
  };

  const handleClearData = () => {
    // In a real app, this would clear all user data
    toast({
      title: "Data Cleared",
      description: "All your food and symptom entries have been deleted",
      variant: "destructive",
    });
  };

  return (
    <div className="pb-24">
      <header className="science-gradient safe-area-top px-6 py-4 text-white">
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <SettingsIcon size={24} />
          <span>Lab Settings</span>
        </h1>
        <p className="text-sm opacity-90 mt-1">Configure your experiment preferences</p>
      </header>

      <main className="px-6 py-6 space-y-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell size={20} className="text-lab-blue" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>
              Manage when and how you receive reminders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="daily-reminders" className="text-sm">
                Daily logging reminders
              </Label>
              <Switch
                id="daily-reminders"
                checked={notifications}
                onCheckedChange={setNotifications}
                data-testid="switch-daily-reminders"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="symptom-alerts" className="text-sm">
                Symptom pattern alerts
              </Label>
              <Switch
                id="symptom-alerts"
                defaultChecked={false}
                data-testid="switch-symptom-alerts"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="weekly-reports" className="text-sm">
                Weekly insight reports
              </Label>
              <Switch
                id="weekly-reports"
                defaultChecked={true}
                data-testid="switch-weekly-reports"
              />
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield size={20} className="text-lab-green" />
              <span>Data & Privacy</span>
            </CardTitle>
            <CardDescription>
              Control your data and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="data-sharing" className="text-sm">
                Anonymous data sharing for research
              </Label>
              <Switch
                id="data-sharing"
                checked={dataSharing}
                onCheckedChange={setDataSharing}
                data-testid="switch-data-sharing"
              />
            </div>
            <Separator />
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handleExportData}
                data-testid="button-export-data"
              >
                <Download size={16} className="mr-2" />
                Export My Data
              </Button>
              <p className="text-xs text-gray-500">
                Download all your food logs, symptoms, and correlations as a CSV file
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Experiment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-lab-amber">🧪</span>
              <span>Experiment Settings</span>
            </CardTitle>
            <CardDescription>
              Configure how correlations are detected
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-correlations" className="text-sm">
                Automatic correlation detection
              </Label>
              <Switch
                id="auto-correlations"
                defaultChecked={true}
                data-testid="switch-auto-correlations"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sensitivity" className="text-sm">
                High sensitivity mode
              </Label>
              <Switch
                id="sensitivity"
                defaultChecked={false}
                data-testid="switch-sensitivity"
              />
            </div>
            <div className="text-xs text-gray-500">
              High sensitivity detects weaker patterns but may show more false positives
            </div>
          </CardContent>
        </Card>

        {/* Support & Help */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle size={20} className="text-lab-red" />
              <span>Support & Help</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              data-testid="button-help-guide"
            >
              <HelpCircle size={16} className="mr-2" />
              How to Use Food Lab
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              data-testid="button-contact-support"
            >
              <Mail size={16} className="mr-2" />
              Contact Support
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <Trash2 size={20} />
              <span>Danger Zone</span>
            </CardTitle>
            <CardDescription>
              Irreversible actions that will delete your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  data-testid="button-clear-all-data"
                >
                  <Trash2 size={16} className="mr-2" />
                  Clear All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your food logs, 
                    symptoms, correlations, and achievements from the lab.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid="button-cancel-clear">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClearData}
                    className="bg-red-600 hover:bg-red-700"
                    data-testid="button-confirm-clear"
                  >
                    Yes, delete everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center space-y-2 py-4">
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <span className="text-2xl">🧪</span>
            <div>
              <p className="font-medium">Food Lab</p>
              <p className="text-xs">Version 1.0.0</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Your personal food and symptom correlation laboratory
          </p>
        </div>
      </main>
    </div>
  );
}

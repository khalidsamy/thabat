/**
 * notificationService.js
 * 📖 MISSION: Smart Pedagogy Reminders (Sheikh Alaa Hamed)
 */

class NotificationService {
  constructor() {
    this.morningTime = 8; // 8:00 AM
    this.eveningTime = 20; // 8:00 PM
  }

  requestPermission() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      void Notification.requestPermission();
    }
  }

  send(title, body) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/ThabatLogo.png',
      });
    }
  }

  /**
   * Checks completion status and sends smart reminders based on time of day.
   * This is called on app load and potentially on a loop.
   */
  checkAndRemind(progress, isArabic = false) {
    if (!progress || progress.revisionGoal === 'NONE') return;

    const now = new Date();
    const hours = now.getHours();
    
    // Check if we already reminded this hour to avoid spamming
    const lastRemindedHour = localStorage.getItem('thabat_last_remind_hour');
    if (lastRemindedHour === hours.toString()) return;

    // Morning Goal (8:00 AM)
    if (hours === this.morningTime && !progress.revisionCompletedToday) {
      const title = isArabic ? 'صباح الخير! ابدأ وردك اليومي' : 'Good Morning! Start your daily Wird';
      const body = isArabic 
        ? `أنت على خطة ${progress.revisionGoal}. لا تنسى إتمام ورد المراجعة اليوم.`
        : `You are on the ${progress.revisionGoal} plan. Don't forget to complete your revision today.`;
      
      this.send(title, body);
      localStorage.setItem('thabat_last_remind_hour', hours.toString());
    }

    // Evening Follow-up (8:00 PM)
    if (hours === this.eveningTime && !progress.revisionCompletedToday) {
      const title = isArabic ? 'تذكير ورد المساء' : 'Evening Wird Reminder';
      const body = isArabic 
        ? 'شارف اليوم على الانتهاء ولم تكمل ورد المراجعة. ثباتك يزداد باستمرارك!'
        : 'The day is almost over and your revision is not yet complete. Consistency is key to Thabat!';
      
      this.send(title, body);
      localStorage.setItem('thabat_last_remind_hour', hours.toString());
    }
  }
}

export default new NotificationService();

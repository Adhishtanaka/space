public static class NotificationThrottler
{
    private static DateTime _lastNotification = DateTime.MinValue;
    private static readonly object _lock = new object();
    private static readonly TimeSpan _throttleInterval = TimeSpan.FromSeconds(10);

    public static bool ShouldNotify()
    {
        lock (_lock)
        {
            var now = DateTime.UtcNow;
            if (now - _lastNotification > _throttleInterval)
            {
                _lastNotification = now;
                return true;
            }
            return false;
        }
    }
}

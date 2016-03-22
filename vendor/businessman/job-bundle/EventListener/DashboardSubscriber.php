<?php
namespace BusinessMan\Bundle\JobBundle\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use BusinessMan\Bundle\BusinessManBundle\Event\CollectDashboardOptionsEvent;
use Symfony\Component\Security\Core\SecurityContextInterface;

/**
 * DashboardSubscriber
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class DashboardSubscriber implements EventSubscriberInterface
{
    /**
     * @var SecurityContextInterface
     */
    private $security;

    /**
     * @param SecurityContextInterface $security
     */
    public function __construct(SecurityContextInterface $security)
    {
        $this->security = $security;
    }

    /**
     * {@inheritDoc}
     */
    public static function getSubscribedEvents()
    {
        return array(
            'dashboard.collect' => array(
                array('onCollect', 0)
            )
        );
    }

    /**
     * Announce this bundle's dashboard items
     *
     * @param CollectDashboardOptionsEvent $event
     */
    public function onCollect(CollectDashboardOptionsEvent $event)
    {
        if ($this->security->isGranted('ROLE_STAFF')) {
            $ownWidget = $event->addWidget(
                'BusinessManJobBundle:Dashboard:listOwnJobs',
                'Your jobs',
                'orange',
                'fa-cogs',
                4,
                4,
                16,
                12
            );

            $ownSummary = $event->addSummary('BusinessManJobBundle:Dashboard:countOwnJobs', 'Your jobs', 'orange', 'fa-cogs');
            $ownSummary->setLinkedOption($ownWidget);
            $ownSummary->setRoute('jobs_list_own');

            $timesheetsWidget = $event->addWidget(
                'BusinessManJobBundle:Dashboard:createTimesheet',
                'Timesheet entry',
                'black',
                'fa-calendar-o',
                4,
                6,
                16,
                12
            );

            $timesheetsSummary = $event->addSummary(
                'BusinessManJobBundle:Dashboard:countMonthlyTimesheets',
                'Timesheets this month',
                'black',
                'fa-calendar-o'
            );

            $timesheetsSummary->setLinkedOption($timesheetsWidget);
        }
    }
}

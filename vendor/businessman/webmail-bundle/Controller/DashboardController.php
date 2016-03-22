<?php
namespace BusinessMan\Bundle\WebmailBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

/**
 * DashboardController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/SchedulerBundle
 */
class DashboardController extends Controller
{
    /**
     * Count the timesheets entered by the logged in user this month
     *
     * @return Response
     *
     * @Cache(public=false, maxage=30)
     * @Security("has_role('ROLE_STAFF')")
     */
    public function countUnreadEmailsAction()
    {
        $this->get('session')->save();

        try {
            $webmail = $this->get('webmail.bridge');
            $webmail->login($this->getUser());

            $mailboxes = $webmail->getInboxCounts();
            $count = 0;

            foreach ($mailboxes as $mailbox) {
                $count += $mailbox['unread'];
            }
        } catch (\Exception $e) {
            $count = '?';
        }

        return new Response($count);
    }
}

<?php
namespace BusinessMan\Bundle\BusinessManBundle\Controller;

use BusinessMan\Bundle\BusinessManBundle\Event\CollectDashboardOptionsEvent;
use Computech\Bundle\CommonBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * DashboardController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/BusinessManBundle
 */
class DashboardController extends Controller
{
    /**
     * @param boolean $bridge
     * @param Request $request
     *
     * @return Response
     *
     * @Cache(public=false, maxage=86400)
     * @Security("has_role('ROLE_USER')")
     */
    public function dashboardAction(Request $request, $bridge = false)
    {
        // Session not required
        $this->get('session')->save();

        // Persist any changes
        if ($request->getMethod() == 'POST') {
            $this->getUser()->setDashboardJson($request->request->get('dashboard'));
            $this->getDoctrine()->getManager()->flush();

            return new JsonResponse(array('success' => true));
        }

        // Collect dashboard items from bundles
        $event = new CollectDashboardOptionsEvent();
        $this->get('event_dispatcher')->dispatch('dashboard.collect', $event);

        $event->addWidget('', 'Dynamic window', null, 'fa-square-o', 6, 3, 16, 12)->setDynamicWindow(true);

        $options = $event->getOptions()->toArray();

        usort($options, function ($a, $b) {
            return strcmp($a->getLabel(), $b->getLabel());
        });

        // Get bridge options
        if ($bridge) {
            $host = $request->query->get('x-filemaker-host');
        } else {
            $host = null;
        }

        return $this->render(
            '@BusinessManBusinessMan/Dashboard/dashboard.html.twig',
            array('options' => $options, 'bridge' => $bridge, 'host' => $host)
        );
    }
}

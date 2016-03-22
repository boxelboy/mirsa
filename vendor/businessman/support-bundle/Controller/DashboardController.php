<?php
namespace BusinessMan\Bundle\SupportBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

/**
 * DashboardController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/SupportBundle
 */
class DashboardController extends Controller
{
    /**
     * Count the tickets awaiting the logged in user's response
     *
     * @return Response
     *
     * @Cache(public=false, maxage=30)
     * @Security("has_role('ROLE_STAFF')")
     */
    public function countAwaitingActionAction()
    {
        $this->get('session')->save();

        $count = $this->getDoctrine()->getRepository('BusinessManSupportBundle:SupportCall')->createQueryBuilder('s')
            ->select('COUNT(s.id)')
            ->andWhere('s.assignedTo = :assigned')
            ->andWhere('s.toAction = :toAction')
            ->setParameter('assigned', $this->getUser()->getStaff())
            ->setParameter('toAction', 'Helpdesk To Action')
            ->getQuery()
            ->getSingleScalarResult();

        return new Response($count);
    }

    /**
     * Count the tickets awaiting the logged in user's response
     *
     * @param boolean $bridge
     *
     * @return Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400)
     * @Security("has_role('ROLE_STAFF')")
     */
    public function listAwaitingActionAction($bridge = false)
    {
        $this->get('session')->save();

        return $this->render(
            '@BusinessManSupport/List/datatable.html.twig',
            array(
                'header' => false,
                'footer' => false,
                'created' => false,
                'updated' => false,
                'status' => false,
                'owner' => false,
                'bridge' => $bridge,
                'url' => $this->generateUrl(
                    'api_support_call_list',
                    array(
                        'filter' => array(
                            'toAction' => 'Helpdesk To Action',
                            'assignedTo' => $this->getUser()->getStaff()->getId()
                        )
                    )
                )
            )
        );
    }
}

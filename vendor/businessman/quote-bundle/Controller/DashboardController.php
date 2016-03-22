<?php
namespace BusinessMan\Bundle\QuoteBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

/**
 * DashboardController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/QuoteBundle
 */
class DashboardController extends Controller
{
    /**
     * Count the open quotes belonging to the logged in user
     *
     * @return Response
     *
     * @Cache(public=false, maxage=30)
     * @Security("has_role('ROLE_STAFF')")
     */
    public function countQuotesAction()
    {
        $this->get('session')->save();

        $count = $this->getDoctrine()->getRepository('BusinessManQuoteBundle:Quote')->createQueryBuilder('q')
            ->select('COUNT(q.id)')
            ->andWhere('q.followUpBy = :staff')
            ->andWhere('q.status IN (:status)')
            ->andWhere('q.followUp <= :followUp')
            ->setParameter('staff', $this->getUser()->getStaff())
            ->setParameter('status', array('Active', 'Open'))
            ->setParameter('followUp', new \DateTime('+7 days'), 'date')
            ->getQuery()
            ->getSingleScalarResult();

        return new Response($count);
    }

    /**
     * List the open quotes belonging to the logged in user
     *
     * @param boolean $bridge
     *
     * @return Response
     *
     * @Security("has_role('ROLE_STAFF')")
     * @Cache(public=true, smaxage=86400, maxage=86400)
     */
    public function listQuotesAction($bridge = false)
    {
        $this->get('session')->save();

        $followUp = new \DateTime('+7 days');

        return $this->render(
            '@BusinessManQuote/List/datatable.html.twig',
            array(
                'header' => false,
                'footer' => false,
                'bridge' => $bridge,
                'url' => $this->generateUrl(
                    'api_quotes_list',
                    array('filter' => array(
                        'followUp' => $followUp->format('Y-m-d'),
                        'followUpBy' => $this->getUser()->getStaff()->getId(),
                        'active' => true
                    ))
                )
            )
        );
    }
}

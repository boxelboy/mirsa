<?php
namespace Mirsa\Bundle\MirsaBundle\Controller;

use BusinessMan\Bundle\JobBundle\Form\Type\ChildJobType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Mirsa\Bundle\MirsaBundle\Entity\WorkOrder;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;

/**
 * WorkOrderController
 *
 * @author cps
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class WorkOrderController extends Controller
{
    /**
     * List all Work Orders
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function listAction()
    {
        return $this->render('MirsaMirsaBundle:WorkOrder:list.html.twig');
    }

    /**
     * View a work order's details
     *
     * @param WorkOrder $workorder
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=60, maxage=60, vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function viewAction(WorkOrder $workOrder)
    {
      /*  $so = $this->getDoctrine()->getRepository('MirsaMirsaBundle:SalesOrder')
            ->createQueryBuilder('so')
            ->select('*)')
            ->andWhere('so.id = :salesorder')
            ->getQuery();*/

        return $this->render(
            'MirsaMirsaBundle:WorkOrder:view.html.twig',
            array('workOrder' => $workOrder)
        );
    }
    

    /**
     * View a Work Order PDF
     *
     * @param WorkOrder $workOrder
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Security("has_role('ROLE_USER')")
     */
    public function downloadAction(WorkOrder $workOrder)
    {
        $containerUrl = $workOrder->getPdf()->getUrl();
        
        $url = sprintf(
            '%s://%s:%s/%s',
            $this->container->getParameter('businessman.protocol'),
            $this->container->getParameter('businessman.host'),
            $this->container->getParameter('businessman.port'),
            $containerUrl
        );

        try {
            return new Response(file_get_contents($url), 200, array('Content-Type' => 'application/pdf'));
        } catch (\Exception $e) {
            throw $this->createNotFoundException();
        }
    }    
}
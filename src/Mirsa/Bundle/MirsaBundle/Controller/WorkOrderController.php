<?php
namespace Mirsa\Bundle\MirsaBundle\Controller;

use BusinessMan\Bundle\JobBundle\Form\Type\ChildJobType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Mirsa\Bundle\MirsaBundle\Entity\WorkOrder;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Mirsa\Bundle\MirsaBundle\Resources\utilities\Filtering;

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
    

    /* Used to export the records, this will also work with the filters */
    public function exportAction(Request $request)
    {
        $id = $request->query->get('id');
        $description = $request->query->get('description');
        $type = $request->query->get('type');
        $status = $request->query->get('status');
        $plannedStartDate = $request->query->get('plannedStartDate');
        $customerName = $request->query->get('customerName');
        $tradingCompany = $request->query->get('tradingCompany');

        $response = new StreamedResponse();
        $response->setCallback(function() use (&$id, &$description, &$type, &$status, &$plannedStartDate, &$customerName, &$tradingCompany) {
            $fc = fopen('php://output', 'w+');
            fputcsv($fc, array('WorkOrder Number', 'Description', 'Type', 'Status', 'Planned Date', 'Customer Name', 'Trading Company'),',');

            $qb = $this->getDoctrine()->getRepository('MirsaMirsaBundle:WorkOrder');
            $qb = $qb->createQueryBuilder('wo');
            $qb = $qb->select('wo.id,wo.description,wo.type,wo.status,wo.plannedStartDate,wo.customerName,wo.tradingCompany');

            $filtering = new Filtering();

            if ($id != "" ) {
                $qb = $qb->andWhere('wo.id = :id');
                $qb = $qb->setParameter('id', $id );
            }  
            if ($description != "" ) {
                $qb = $qb->andWhere('LOWER(wo.description) LIKE :description');
                $qb = $qb->setParameter('description', '%' . strtolower($description) . '%');
            }         
            if ($type != "" ) {
                $qb = $qb->andWhere('LOWER(wo.type) LIKE :type');
                $qb = $qb->setParameter('type', '%' . strtolower($type) . '%');
            }
            if ($status != "" ) {
                $qb = $qb->andWhere('LOWER(wo.status) LIKE :status');
                $qb = $qb->setParameter('status', '%' . strtolower($status) . '%');
            }                        
            if ($plannedStartDate != "" ) {
                $filtering->DateFilter('plannedStartDate', $plannedStartDate, $qb, 'wo');
                //$qb = $qb->andWhere('wo.plannedStartDate = :plannedStartDate');
                //$qb = $qb->setParameter('plannedStartDate', \DateTime::createFromFormat('m/d/Y', $plannedStartDate), 'date');
            }            
            if ($customerName != "" ) {
                $qb = $qb->andWhere('LOWER(wo.customerName) LIKE :customerName');
                $qb = $qb->setParameter('customerName', '%' . strtolower($customerName) . '%');
            }
            if ($tradingCompany != "" ) {
                $qb = $qb->andWhere('LOWER(wo.tradingCompany) LIKE :tradingCompany');
                $qb = $qb->setParameter('tradingCompany', '%' . strtolower($tradingCompany) . '%');
            }

            /* Only export the items for the currently logged in client*/
            if (!is_null($this->getUser()->getContact())) { 
                if ($this->getUser()->getContact()->getClient()) {
                    $qb = $qb->andWhere('wo.client = :client');
                    $qb = $qb->setParameter('client', $this->getUser()->getContact()->getClient());
                }
            }
            $qb = $qb->getQuery();
            $workOrders = $qb->getResult();

            foreach ($workOrders as $item)
            {
                if (is_null($item['plannedStartDate']))
                {
                    $formattedPlannedStartDate = "";
                } else {
                    $formattedPlannedStartDate = date_format($item['plannedStartDate'], "m/d/Y");
                } 

                fputcsv($fc, array($item['id'],
                                $item['description'],
                                $item['type'],
                                $item['status'],
                                $formattedPlannedStartDate,
                                $item['customerName'],
                                $item['tradingCompany']),
                         ',');
            }
            fclose($fc);
        });
        $filename = "work_orders_export_".date("m_d_Y_His").".csv";
        $response->setStatusCode(200);
        $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
        $response->headers->set('Content-Disposition','attachment; filename=' . $filename);
        return $response;
    }
}
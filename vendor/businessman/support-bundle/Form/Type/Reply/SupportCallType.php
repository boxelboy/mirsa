<?php
namespace BusinessMan\Bundle\SupportBundle\Form\Type\Reply;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

/**
 * SupportCallType
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/SupportBundle
 */
class SupportCallType extends AbstractType
{
    /**
     * {@inheritDoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add(
            'status',
            'choice',
            array(
                'choices' => array(
                    'New' => 'New',
                    'Open' => 'Open',
                    'Cancelled' => 'Cancelled',
                    'Closed' => 'Closed',
                    'Complete' => 'Complete'
                )
            )
        );

        $builder->add(
            'toAction',
            'choice',
            array(
                'choices' => array(
                    'Helpdesk To Action' => 'Helpdesk to reply',
                    'Waiting For Customer Feedback' => 'Customer to reply'
                )
            )
        );
    }

    /**
     * {@inheritDoc}
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(
            array(
                'data_class' => 'BusinessMan\Bundle\SupportBundle\Entity\SupportCall',
            )
        );
    }

    /**
     * {@inheritDoc}
     */
    public function getName()
    {
        return 'ticket';
    }
}
